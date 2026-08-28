import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>
            Buyer <span>Hunting</span>
          </h1>
          <p>CRM lokal untuk produk kelapa</p>
        </div>
        <div className="login-buttons">
          <button className="btn-primary" onClick={() => signIn("anonymous")}>
            Masuk sebagai Guest
          </button>
        </div>
        <p style={{ marginTop: 16, fontSize: 12, color: "#687383", textAlign: "center" }}>
          Login dengan Google/GitHub bisa ditambahkan nanti via Convex Dashboard
        </p>
      </div>
    </div>
  );
}
