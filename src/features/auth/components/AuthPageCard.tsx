import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

interface AuthPageCardProps {
  mode: "signin" | "signup";
  children: ReactNode;
}

const AuthPageCard = ({ mode, children }: AuthPageCardProps) => (
  <div className="auth-card">
    {/* ── Left visual panel ── */}
    <div className="auth-panel auth-panel--left" aria-hidden="false">
      <div className="auth-panel__orb auth-panel__orb--1" aria-hidden="true" />
      <div className="auth-panel__orb auth-panel__orb--2" aria-hidden="true" />

      <div className="auth-panel__brand">
        <span className="auth-panel__logo">Perspectiva</span>
        <p className="auth-panel__tagline">
          Turn every opinion into an edge.
        </p>
      </div>

      <p className="auth-panel__switch">
        {mode === "signin" ? (
          <>
            Not a member?{" "}
            <Link to={ROUTES.signUp} className="auth-panel__switch-link">
              Register now
            </Link>
          </>
        ) : (
          <>
            Already a member?{" "}
            <Link to={ROUTES.signIn} className="auth-panel__switch-link">
              Log in now
            </Link>
          </>
        )}
      </p>
    </div>

    {/* ── Right form panel ── */}
    <div className="auth-panel auth-panel--right">
      <nav className="auth-tabs" aria-label="Authentication mode">
        <Link
          to={ROUTES.signIn}
          className={`auth-tab${mode === "signin" ? " auth-tab--active" : ""}`}
          aria-current={mode === "signin" ? "page" : undefined}
        >
          Sign In
        </Link>
        <Link
          to={ROUTES.signUp}
          className={`auth-tab${mode === "signup" ? " auth-tab--active" : ""}`}
          aria-current={mode === "signup" ? "page" : undefined}
        >
          Sign Up
        </Link>
      </nav>

      <h1 className="auth-form__heading">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>

      <div className="auth-form__body">{children}</div>
    </div>
  </div>
);

export default AuthPageCard;
