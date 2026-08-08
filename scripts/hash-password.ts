/**
 * CLI: generate a PBKDF2 password hash for the admin seed.
 * Usage: npm run hash-password -- "mysecretpassword"
 */
import { hashPassword } from "../lib/auth/password";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run hash-password -- <password>");
  process.exit(1);
}

hashPassword(password)
  .then((hash) => {
    console.log(hash);
  })
  .catch((err) => {
    console.error("Failed to hash password:", err);
    process.exit(1);
  });

export {};
