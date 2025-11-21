// src/scripts/generateKeys.ts
import { generateKeyPairSync } from "crypto";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const keysDir = join(process.cwd(), "keys");

// Create keys directory if it doesn't exist
if (!existsSync(keysDir)) {
  mkdirSync(keysDir, { recursive: true });
}

console.log("Generating RS256 key pairs...\n");

// Generate access token key pair
const accessKeyPair = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// Generate refresh token key pair
const refreshKeyPair = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// Write access token keys
writeFileSync(join(keysDir, "access-private.pem"), accessKeyPair.privateKey);
writeFileSync(join(keysDir, "access-public.pem"), accessKeyPair.publicKey);

// Write refresh token keys
writeFileSync(join(keysDir, "refresh-private.pem"), refreshKeyPair.privateKey);
writeFileSync(join(keysDir, "refresh-public.pem"), refreshKeyPair.publicKey);

console.log("✓ Generated access token key pair:");
console.log("  - keys/access-private.pem");
console.log("  - keys/access-public.pem");
console.log("\n✓ Generated refresh token key pair:");
console.log("  - keys/refresh-private.pem");
console.log("  - keys/refresh-public.pem");
console.log("\n⚠ Important: Add keys/ to .gitignore to keep keys secure!");
console.log("\nUpdate your .env file with these paths:");
console.log("JWT_ACCESS_PRIVATE_KEY=./keys/access-private.pem");
console.log("JWT_ACCESS_PUBLIC_KEY=./keys/access-public.pem");
console.log("JWT_REFRESH_PRIVATE_KEY=./keys/refresh-private.pem");
console.log("JWT_REFRESH_PUBLIC_KEY=./keys/refresh-public.pem");
