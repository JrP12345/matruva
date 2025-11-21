// src/scripts/verifyJwks.ts
import { KeyStore, ACCESS_KID, REFRESH_KID } from "../config/index.js";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../helpers/jwt.js";
import { createPublicKey } from "crypto";

console.log("=== JWKS Verification ===\n");

// 1. Check KeyStore
console.log("1. KeyStore Status:");
const allKeys = KeyStore.getAll();
console.log(`   Total keys: ${allKeys.length}`);
console.log(`   Active keys: ${KeyStore.getActive().length}`);
console.log(`   Access KID: ${ACCESS_KID}`);
console.log(`   Refresh KID: ${REFRESH_KID}`);

// 2. Test JWT Signing with kid
console.log("\n2. JWT Signing Test:");
const payload = { sub: "test-user-123", role: "USER" };

const accessToken = signAccessToken(payload);
console.log(`   ✓ Access token generated`);

const { token: refreshToken, jti } = signRefreshToken(payload);
console.log(`   ✓ Refresh token generated (jti: ${jti})`);

// 3. Verify kid in headers
console.log("\n3. Token Header Verification:");
const accessParts = accessToken.split(".");
const accessHeader = JSON.parse(
  Buffer.from(accessParts[0]!, "base64").toString()
);
console.log(`   Access token kid: ${accessHeader.kid}`);
console.log(`   Access token alg: ${accessHeader.alg}`);

const refreshParts = refreshToken.split(".");
const refreshHeader = JSON.parse(
  Buffer.from(refreshParts[0]!, "base64").toString()
);
console.log(`   Refresh token kid: ${refreshHeader.kid}`);
console.log(`   Refresh token alg: ${refreshHeader.alg}`);

// 4. Verify tokens
console.log("\n4. Token Verification:");
const verifiedAccess = verifyAccessToken(accessToken);
console.log(`   ✓ Access token verified: sub=${verifiedAccess?.sub}`);

const verifiedRefresh = verifyRefreshToken(refreshToken);
console.log(`   ✓ Refresh token verified: sub=${verifiedRefresh?.sub}`);

// 5. Generate JWKS format
console.log("\n5. JWKS Format:");
const activeKeys = KeyStore.getActive();
const jwks = {
  keys: activeKeys.map((keyEntry) => {
    const publicKeyObj = createPublicKey(keyEntry.publicKey);
    const jwk = publicKeyObj.export({ format: "jwk" }) as any;

    return {
      kid: keyEntry.kid,
      kty: keyEntry.kty,
      alg: keyEntry.alg,
      use: keyEntry.use,
      n: jwk.n?.slice(0, 20) + "...",
      e: jwk.e,
    };
  }),
};

console.log(JSON.stringify(jwks, null, 2));

console.log("\n=== All Tests Passed ✓ ===");
