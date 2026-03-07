import { Link } from "../Link";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="boltdocs-not-found">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-text">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="not-found-link">
          <ArrowLeft size={16} /> Go to Home
        </Link>
      </div>
    </div>
  );
}
