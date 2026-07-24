import crypto from "crypto";

const DEFAULT_ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 60 * 24;

const base64UrlEncode = (value: string | Buffer) =>
  (typeof value === "string" ? Buffer.from(value) : value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);

  return Buffer.from(`${base64}${padding}`, "base64").toString("utf8");
};

type AccessTokenPayload = {
  sub: string;
  userName: string;
  iat: number;
  exp: number;
};

const getAccessTokenExpirySeconds = () => {
  const configuredExpiry = Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS);

  return Number.isInteger(configuredExpiry) && configuredExpiry > 0
    ? configuredExpiry
    : DEFAULT_ACCESS_TOKEN_EXPIRY_SECONDS;
};

export const createAccessToken = (user: { id: number; userName: string }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresInSeconds = getAccessTokenExpirySeconds();
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: String(user.id),
      userName: user.userName,
      iat: issuedAt,
      exp: issuedAt + expiresInSeconds,
    })
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = base64UrlEncode(
    crypto.createHmac("sha256", secret).update(unsignedToken).digest()
  );

  return { token: `${unsignedToken}.${signature}`, expiresInSeconds };
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  const [encodedHeader, encodedPayload, signature, ...extraParts] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature || extraParts.length > 0) {
    return null;
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = base64UrlEncode(
    crypto.createHmac("sha256", secret).update(unsignedToken).digest()
  );
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader));
    const payload: unknown = JSON.parse(base64UrlDecode(encodedPayload));

    if (
      header.alg !== "HS256" ||
      header.typ !== "JWT" ||
      typeof payload !== "object" ||
      payload === null
    ) {
      return null;
    }

    const { sub, userName, iat, exp } = payload as AccessTokenPayload;
    if (
      typeof sub !== "string" ||
      typeof userName !== "string" ||
      !Number.isInteger(iat) ||
      !Number.isInteger(exp) ||
      exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return { sub, userName, iat, exp };
  } catch {
    return null;
  }
};

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return `${salt}:${derivedKey}`;
};

export const verifyPassword = (password: string, hashedPassword: string) => {
  const [salt, storedHash] = hashedPassword.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(storedHash, "hex"),
    Buffer.from(derivedKey, "hex")
  );
};
