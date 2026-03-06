import { Zap } from "lucide-react";

export function PoweredBy() {
  return (
    <div className="powered-by-container">
      <a
        href="https://github.com/jesusalcaladev/boltdocs"
        target="_blank"
        rel="noopener noreferrer"
        className="powered-by-link"
      >
        <Zap className="powered-by-icon" size={12} fill="currentColor" />
        <span>Powered by</span>
        <span className="powered-by-brand">LiteDocs</span>
      </a>
    </div>
  );
}
