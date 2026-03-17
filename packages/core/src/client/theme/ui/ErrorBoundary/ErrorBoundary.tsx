import { Component, ErrorInfo, ReactNode } from "react";
import "./error-boundary.css";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Boltdocs Layout:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="boltdocs-error-boundary">
            <div className="boltdocs-error-title">Something went wrong</div>
            <p className="boltdocs-error-message">
              {this.state.error?.message ||
                "An unexpected error occurred while rendering this page."}
            </p>
            <button
              className="boltdocs-error-retry"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
