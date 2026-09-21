import { customAlphabet } from "nanoid";
import bcrypt from "bcryptjs";

// No ambiguous characters (0/O, 1/I/l) to keep codes easy to read back over
// a low-quality connection.
const codeAlphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const nanoCode = customAlphabet(codeAlphabet, 7);

export function generateCaseCode(): string {
  return `EKY-${nanoCode()}`;
}

const pinAlphabet = "0123456789";
const nanoPin = customAlphabet(pinAlphabet, 4);

export function generatePin(): string {
  return nanoPin();
}

export function hashPin(pin: string): string {
  return bcrypt.hashSync(pin, 8);
}

export function verifyPin(pin: string, hash: string): boolean {
  return bcrypt.compareSync(pin, hash);
}
