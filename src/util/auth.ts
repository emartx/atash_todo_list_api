import crypto from "crypto";

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
