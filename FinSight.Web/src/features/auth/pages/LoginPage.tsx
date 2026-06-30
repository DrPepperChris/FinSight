import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <main className="page">
      <div className="page-header">
        <h1>Login</h1>
        <p>Sign in with a FinSight test user.</p>
      </div>

      <LoginForm />
    </main>
  );
}