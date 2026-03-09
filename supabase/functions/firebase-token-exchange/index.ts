import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SignJWT, importJWK } from "https://deno.land/x/jose@v5.2.0/index.ts";

const SIGNING_KEY_JWK = Deno.env.get("SIGNING_KEY_JWK") || "";
const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID") || "";

interface FirebaseTokenPayload {
  iss: string;
  aud: string;
  sub: string;
  email?: string;
  exp: number;
  iat: number;
}

/**
 * Firebase IDトークンを検証
 */
async function verifyFirebaseToken(
  token: string
): Promise<FirebaseTokenPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  // ペイロードをデコード
  const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
  const payload: FirebaseTokenPayload = JSON.parse(payloadJson);

  // 基本的な検証
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp < now) {
    throw new Error("Token expired");
  }

  if (payload.aud !== FIREBASE_PROJECT_ID) {
    throw new Error("Invalid audience");
  }

  if (
    !payload.iss.startsWith(
      "https://securetoken.google.com/" + FIREBASE_PROJECT_ID
    )
  ) {
    throw new Error("Invalid issuer");
  }

  if (!payload.sub) {
    throw new Error("Missing subject");
  }

  return payload;
}

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://shift-scheduler-app-vu6i.onrender.com",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { firebaseToken } = await req.json();

    if (!firebaseToken) {
      return new Response(
        JSON.stringify({ error: "firebaseToken is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Firebase IDトークンを検証
    const firebasePayload = await verifyFirebaseToken(firebaseToken);

    // ES256秘密鍵をインポート
    const jwk = JSON.parse(SIGNING_KEY_JWK);
    const privateKey = await importJWK(jwk, "ES256");

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour

    // Supabase JWT を ES256 で署名
    const accessToken = await new SignJWT({
      aud: "authenticated",
      iss: "supabase",
      sub: firebasePayload.sub, // Firebase UID
      email: firebasePayload.email || "",
      role: "authenticated",
    })
      .setProtectedHeader({
        alg: "ES256",
        kid: jwk.kid,
        typ: "JWT",
      })
      .setIssuedAt(now)
      .setExpirationTime(now + expiresIn)
      .sign(privateKey);

    return new Response(
      JSON.stringify({
        access_token: accessToken,
        refresh_token: accessToken,
        token_type: "bearer",
        expires_in: expiresIn,
        user: {
          id: firebasePayload.sub,
          email: firebasePayload.email,
          role: "authenticated",
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
