"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="section-shell pb-24">
          <div className="panel-2xl p-8 max-w-xl">
            <p className="text-xs uppercase tracking-eyebrow text-error">Admin error</p>
            <h2 className="font-[family:var(--font-display)] mt-3 text-2xl uppercase">
              Something went wrong
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {this.state.error.message}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="control-pill mt-6"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
