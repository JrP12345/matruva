// src/routes/jwks.ts
import express from "express";
import { KeyStore } from "../config/index.js";
import { createPublicKey } from "crypto";

const router = express.Router();

/**
 * JWKS (JSON Web Key Set) endpoint
 * Returns public keys in standard JWKS format for token verification
 */
router.get("/.well-known/jwks.json", (req, res) => {
  try {
    const activeKeys = KeyStore.getActive();

    const jwks = {
      keys: activeKeys.map((keyEntry) => {
        // Convert PEM to JWK format
        const publicKeyObj = createPublicKey(keyEntry.publicKey);
        const jwk = publicKeyObj.export({ format: "jwk" }) as any;

        return {
          kid: keyEntry.kid,
          kty: keyEntry.kty,
          alg: keyEntry.alg,
          use: keyEntry.use,
          n: jwk.n,
          e: jwk.e,
        };
      }),
    };

    res.json(jwks);
  } catch (error) {
    console.error("JWKS generation error:", error);
    res.status(500).json({ error: "Failed to generate JWKS" });
  }
});

export default router;
