"use client";

import { useCallback, useEffect } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

type AdminCredentials = {
  email: string;
  password: string;
};

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
        showStatus(
          "This Supabase account is not authorized for the admin workspace."
        );
        return false;
      }

      setSessionEmail(session.user.email);
      await onAuthorized();
      return true;
    },
    [
      onAuthorized,
      onSessionEnded,
      setSessionEmail,
      showStatus,
      supabase
    ]
  );

  useEffect(() => {
    if (!supabase) {
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

        showStatus("Signed in. Project syncing is now enabled.");
        onSignInSuccess();
        resetCredentials();
      } catch (error) {
        showStatus(error instanceof Error ? error.message : "Sign-in failed.");
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
    showStatus(
      "Signed out. Templates remain available for new project drafts."
    );
  }, [
    onBeforeAuth,
    onSessionEnded,
    setSessionEmail,
    showStatus,
    supabase
  ]);

  return {
    handleSignIn,
    handleSignOut
  };
}
