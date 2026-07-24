import crypto from "crypto";

const DEFAULT_ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 60 * 24;

const base64UrlEncode = (value: string | Buffer) =>
  (typeof value === "string" ? Buffer.from(value) : value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

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
