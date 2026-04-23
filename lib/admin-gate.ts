const textEncoder = new TextEncoder();

export const ADMIN_GATE_COOKIE = "admin_gate_session";
export const ADMIN_GATE_MAX_AGE_SECONDS = 60 * 60 * 12;

type AdminGatePayload = {
  exp: number;
  user: string;
};

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

function getAdminGateUser() {
  return process.env.ADMIN_GATE_USER?.trim() ?? "";
}

function getAdminGatePassword() {
  return process.env.ADMIN_GATE_PASSWORD?.trim() ?? "";
}

function getAdminGateSecret() {
  return process.env.ADMIN_GATE_SECRET?.trim() ?? "";
}

export function isAdminGateEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_ADMIN === "true"
  );
}

export function isAdminGateConfigured() {
  if (!isAdminGateEnabled()) {
    return true;
  }

  return Boolean(
    getAdminGateUser() && getAdminGatePassword() && getAdminGateSecret()
  );
}

export function areAdminGateCredentialsValid(username: string, password: string) {
  const expectedUser = getAdminGateUser();
  const expectedPassword = getAdminGatePassword();

  return (
    Boolean(expectedUser && expectedPassword) &&
    constantTimeEqual(username, expectedUser) &&
    constantTimeEqual(password, expectedPassword)
  );
}

async function signValue(value: string) {
  const secret = getAdminGateSecret();

  if (!secret) {
    throw new Error("ADMIN_GATE_SECRET is missing.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(value)
  );

  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createAdminGateCookieValue(username: string) {
  const payload: AdminGatePayload = {
    user: username,
    exp: Date.now() + ADMIN_GATE_MAX_AGE_SECONDS * 1000
  };

  const encodedPayload = bytesToBase64Url(
    textEncoder.encode(JSON.stringify(payload))
  );
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminGateCookieValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = await signValue(encodedPayload);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(encodedPayload))
    ) as Partial<AdminGatePayload>;

    return (
      payload.user === getAdminGateUser() &&
      typeof payload.exp === "number" &&
      payload.exp > Date.now()
    );
  } catch {
    return false;
  }
}
