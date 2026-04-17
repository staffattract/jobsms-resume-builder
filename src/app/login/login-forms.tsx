"use client";

import { useActionState } from "react";
import {
  loginAction,
  registerAction,
  type AuthFormState,
} from "@/lib/auth/form-actions";

export function LoginForms() {
  const [loginState, loginFormAction, loginPending] = useActionState<
    AuthFormState,
    FormData
  >(loginAction, {});
  const [registerState, registerFormAction, registerPending] = useActionState<
    AuthFormState,
    FormData
  >(registerAction, {});

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ marginTop: 0 }}>Sign in</h1>
      <form action={loginFormAction} style={{ marginBottom: "32px" }}>
        <div style={{ marginBottom: "8px" }}>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              style={{ display: "block", width: "100%" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              style={{ display: "block", width: "100%" }}
            />
          </label>
        </div>
        {loginState?.error ? (
          <p style={{ color: "crimson", fontSize: "14px" }}>{loginState.error}</p>
        ) : null}
        <button type="submit" disabled={loginPending}>
          {loginPending ? "…" : "Log in"}
        </button>
      </form>

      <h2 style={{ fontSize: "18px" }}>Create account</h2>
      <form action={registerFormAction}>
        <div style={{ marginBottom: "8px" }}>
          <label>
            Name (optional)
            <input
              name="name"
              autoComplete="name"
              style={{ display: "block", width: "100%" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              style={{ display: "block", width: "100%" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <label>
            Password (min 8 characters)
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              style={{ display: "block", width: "100%" }}
            />
          </label>
        </div>
        {registerState?.error ? (
          <p style={{ color: "crimson", fontSize: "14px" }}>
            {registerState.error}
          </p>
        ) : null}
        <button type="submit" disabled={registerPending}>
          {registerPending ? "…" : "Register"}
        </button>
      </form>
    </div>
  );
}
