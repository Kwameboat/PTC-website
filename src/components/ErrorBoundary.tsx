import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-deep-black flex items-center justify-center p-6 text-center">
          <div className="glass-card p-12 max-w-lg">
            <h2 className="text-3xl font-display font-bold text-gold-primary mb-4">Something went wrong</h2>
            <p className="text-white/60 mb-8">
              We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
            </p>
            <pre className="bg-black/50 p-4 rounded-lg text-left text-xs text-red-400 overflow-auto max-h-40 mb-8">
              {this.state.error?.message}
            </pre>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Button = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="gold-gradient text-deep-black px-8 py-3 rounded-full font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
  >
    {children}
  </button>
);
