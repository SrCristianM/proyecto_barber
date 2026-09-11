import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword) {
  if (!plainPassword) return "";
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false;
  if (plainPassword === hashedPassword) return true;
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
    return plainPassword === hashedPassword;
  }
}
