import "./dom-setup";
import assert from "node:assert/strict";
import test from "node:test";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { act, renderHook } from "@testing-library/react";
import { useAdminSession } from "../hooks/use-admin-session";

function session(email: string): Session {
  return {
    user: { email }
  } as unknown as Session;
}

function createSessionClient(options: {
  initialSession?: Session | null;
  isAdmin?: boolean;
}) {
  const events: string[] = [];
  let authStateCallback:
    | ((event: string, session: Session | null) => void)
    | null = null;

  const client = {
    auth: {
      getSession: async () => {
        events.push("getSession");
        return { data: { session: options.initialSession ?? null } };
      },
      onAuthStateChange: (
        callback: (event: string, session: Session | null) => void
      ) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: async ({ email }: { email: string }) => {
        events.push("signInWithPassword");
        return { data: { session: session(email) }, error: null };
      },
      signOut: async () => {
        events.push("signOut");
        return { error: null };
      }
    },
    rpc: async (fn: string) => {
      events.push(`rpc:${fn}`);
      return { data: options.isAdmin ?? true, error: null };
    }
  };

  return {
    client: client as unknown as SupabaseClient,
    events,
    emitAuthStateChange(event: string, nextSession: Session | null) {
      authStateCallback?.(event, nextSession);
    }
  };
}

function renderSession(options: {
  supabase: SupabaseClient | null;
  isAdmin?: boolean;
}) {
  const calls: string[] = [];
  const statusMessages: string[] = [];
  // Stable across renders, like the memoized callbacks useAdminData passes in
  // production — inline closures here would give the bootstrap effect a new
  // dependency identity on every render it itself triggers, looping forever.
  const setSessionEmail = () => calls.push("setSessionEmail");
  const setWorking = () => calls.push("setWorking");
  const onBeforeAuth = () => calls.push("onBeforeAuth");
  const onAuthorized = async () => {
    calls.push("onAuthorized");
  };
  const onBootstrap = async () => {
    calls.push("onBootstrap");
  };
  const onSessionEnded = () => calls.push("onSessionEnded");
  const onSignInSuccess = () => calls.push("onSignInSuccess");
  const resetCredentials = () => calls.push("resetCredentials");
  const showStatus = (message: string) => statusMessages.push(message);

  const view = renderHook(
    ({ email, password }: { email: string; password: string }) =>
      useAdminSession({
        supabase: options.supabase,
        credentials: { email, password },
        setSessionEmail,
        setWorking,
        onBeforeAuth,
        onAuthorized,
        onBootstrap,
        onSessionEnded,
        onSignInSuccess,
        resetCredentials,
        showStatus
      }),
    { initialProps: { email: "admin@example.com", password: "secret" } }
  );

  return { ...view, calls, statusMessages };
}

test("bootstraps without a session when Supabase is not configured", async () => {
  const { calls } = renderSession({ supabase: null });

  await act(async () => {
    await Promise.resolve();
  });

  assert.ok(calls.includes("onBootstrap"));
  assert.ok(!calls.includes("onAuthorized"));
});

test("a restored admin session bootstraps and authorizes", async () => {
  const { client } = createSessionClient({
    initialSession: session("admin@example.com"),
    isAdmin: true
  });
  const { calls } = renderSession({ supabase: client });

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  assert.ok(calls.includes("onBootstrap"));
  assert.ok(calls.includes("onAuthorized"));
  assert.ok(calls.includes("setSessionEmail"));
});

test("a restored session for a non-admin account is signed out", async () => {
  const { client, events } = createSessionClient({
    initialSession: session("stranger@example.com"),
    isAdmin: false
  });
  const { calls, statusMessages } = renderSession({ supabase: client });

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  assert.ok(events.includes("signOut"));
  assert.ok(calls.includes("onSessionEnded"));
  assert.ok(!calls.includes("onAuthorized"));
  assert.match(statusMessages[0], /not authorized/);
});

test("handleSignIn signs in, authorizes, and resets credentials on success", async () => {
  const { client } = createSessionClient({ isAdmin: true });
  const { result, calls } = renderSession({ supabase: client });

  await act(async () => {
    await result.current.handleSignIn();
  });

  assert.ok(calls.includes("onSignInSuccess"));
  assert.ok(calls.includes("resetCredentials"));
  assert.equal(result.current.signInMessage?.tone, "success");
});

test("handleSignOut signs out and reports a success message", async () => {
  const { client, events } = createSessionClient({ isAdmin: true });
  const { result, calls } = renderSession({ supabase: client });

  await act(async () => {
    await result.current.handleSignOut();
  });

  assert.ok(events.includes("signOut"));
  assert.ok(calls.includes("onSessionEnded"));
  assert.equal(result.current.signInMessage?.tone, "success");
});
