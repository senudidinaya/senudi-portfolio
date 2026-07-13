// Generate the bcrypt hash for your admin password.
//   node scripts/hash-password.mjs "your-strong-password"
// Put the printed value in the ADMIN_PASSWORD_HASH environment variable.
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(hash);
