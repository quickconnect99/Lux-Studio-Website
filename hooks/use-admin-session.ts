"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

type AdminCredentials = {
  email: string;
  password: string;
};

export type SignInMessage = { tone: "error" | "success"; text: string } | null;

type UseAdminSessionOptions = {
  supabase: SupabaseClient | null;
  credentials: AdminCredentials;
  setSessionEmail(email: string | null): void;
  setWorking(working: boolean): void;
  onBeforeAuth(): void;
  onAuthorized(): Promise<void>;
  onBootstrap(): Promise<void>;
  onSessionEnded(): void;
  onSignInSuccess(): void;
  resetCredentials(): void;
  showStatus(message: string): void;
};

/**
 * Synchronizes Supabase authentication with access to the admin workspace.
 *
 * A valid login is not sufficient by itself: every restored or newly created
 * session is checked through the database `is_admin()` function. Unauthorized
 * sessions are signed out immediately. The supplied lifecycle callbacks let
 * the orchestration layer load or reset data without duplicating auth logic.
 *
 * @param options - Supabase client, credentials, and admin lifecycle callbacks.
 * @returns Sign-in/sign-out handlers and the latest user-facing auth message.
 */
export function useAdminSession({
  supabase,
  credentials,
  setSessionEmail,
  setWorking,
  onBeforeAuth,
  onAuthorized,
  onBootstrap,
  onSessionEnded,
  onSignInSuccess,
  resetCredentials,
  showStatus
}: UseAdminSessionOptions) {
  const [signInMessage, setSignInMessage] = useState<SignInMessage>(null);

  const authorizeSession = useCallback(
    async (session: Session | null) => {
      if (!supabase || !session?.user.email) {
        setSessionEmail(null);
        onSessionEnded();
        return false;
      }

      const { data: isAdmin, error } = await supabase.rpc("is_admin");

      if (error || isAdmin !== true) {
        await supabase.auth.signOut();
        setSessionEmail(null);
        onSessionEnded();
        const message =
          "This Supabase account is not authorized for the admin workspace.";
        showStatus(message);
        setSignInMessage({ tone: "error", text: message });
        return false;
      }

      setSessionEmail(session.user.email);
      await onAuthorized();
      return true;
    },
    [onAuthorized, onSessionEnded, setSessionEmail, showStatus, supabase]
  );

  useEffect(() => {
    if (!supabase) {
      void onBootstrap();
      return;
    }

    const supabaseClient = supabase;
    let active = true;

    async function bootstrap() {
      await onBootstrap();
      const {
        data: { session }
      } = await supabaseClient.auth.getSession();

      if (active) {
        await authorizeSession(session);
      }
    }

    void bootstrap();

    const {
      data: { subscription }
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user.email) {
        void authorizeSession(session);
        return;
      }

      setSessionEmail(null);
      onSessionEnded();
      void onBootstrap();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [
    authorizeSession,
    onBootstrap,
    onSessionEnded,
    setSessionEmail,
    supabase
  ]);

  const handleSignIn = useCallback(
    async (event?: { preventDefault(): void }) => {
      event?.preventDefault();

      if (!supabase) {
        return;
      }

      onBeforeAuth();
      setSignInMessage(null);
      setWorking(true);

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error) {
          throw error;
        }

        const authorized = await authorizeSession(data.session);
        if (!authorized) {
          return;
        }

        const message = "Signed in. Project syncing is now enabled.";
        showStatus(message);
        setSignInMessage({ tone: "success", text: message });
        onSignInSuccess();
        resetCredentials();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Sign-in failed.";
        showStatus(message);
        setSignInMessage({ tone: "error", text: message });
      } finally {
        setWorking(false);
      }
    },
    [
      authorizeSession,
      credentials.email,
      credentials.password,
      onBeforeAuth,
      onSignInSuccess,
      resetCredentials,
      setWorking,
      showStatus,
      supabase
    ]
  );

  const handleSignOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    onBeforeAuth();
    await supabase.auth.signOut();
    setSessionEmail(null);
    onSessionEnded();
    const message =
      "Signed out. Templates remain available for new project drafts.";
    showStatus(message);
    setSignInMessage({ tone: "success", text: message });
  }, [onBeforeAuth, onSessionEnded, setSessionEmail, showStatus, supabase]);

  return {
    handleSignIn,
    handleSignOut,
    signInMessage
  };
}
