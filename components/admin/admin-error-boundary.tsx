"use client";

import { Component, type ReactNode } from "react";
import { isChunkLoadError } from "@/lib/chunk-load-error";

type Props = {
  children: ReactNode;
  hasUnsavedChanges?: boolean;
  panelLabel?: string;
};
type State = { error: Error | null };

const CHUNK_RELOAD_KEY = "lux-admin-chunk-reload";
const CHUNK_RELOAD_COOLDOWN_MS = 30_000;

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (!isChunkLoadError(error) || this.props.hasUnsavedChanges) {
      return;
    }

    try {
      const now = Date.now();
      const previousReload = Number(
        window.sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0
      );

      if (now - previousReload < CHUNK_RELOAD_COOLDOWN_MS) {
        return;
      }

      window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
      window.location.reload();
    } catch {
      // A blocked sessionStorage must not hide the manual reload action.
    }
  }

  render() {
    if (this.state.error) {
      const chunkLoadFailed = isChunkLoadError(this.state.error);
      const preserveDraft = chunkLoadFailed && this.props.hasUnsavedChanges;
      const panelLabel = this.props.panelLabel ?? "admin workspace";

      return (
        <div className="section-shell pb-24" role="alert">
          <div className="panel-2xl max-w-xl p-8">
            <p className="text-xs uppercase tracking-eyebrow text-error-text">
              {chunkLoadFailed ? "Admin updated" : `${panelLabel} error`}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl uppercase">
              {chunkLoadFailed
                ? preserveDraft
                  ? "Your draft is still available"
                  : "A newer version is available"
                : "Something went wrong"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {chunkLoadFailed
                ? preserveDraft
                  ? `A newer version interrupted the ${panelLabel}. Try loading only this panel first. Reload the page only if needed; recoverable text changes are kept locally.`
                  : "The website was updated while this browser tab was open. Reload the page to continue with the latest admin version."
                : this.state.error.message}
            </p>
            {chunkLoadFailed ? (
              <details className="mt-4 text-xs leading-6 text-muted">
                <summary className="cursor-pointer">Technical details</summary>
                <p className="mt-2 break-all">{this.state.error.message}</p>
              </details>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => this.setState({ error: null })}
                className="control-pill"
              >
                {chunkLoadFailed ? "Try panel again" : "Try again"}
              </button>
              {chunkLoadFailed ? (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="control-pill"
                >
                  Reload page
                </button>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
