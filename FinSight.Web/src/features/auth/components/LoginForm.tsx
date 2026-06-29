import React from "react";
import { login } from "../api/authApi";
import { saveToken } from "../../../lib/tokenStorage";

export function LoginForm() {
  const [userNameOrEmail, setUserNameOrEmail] = React.useState("admin");
  const [password, setPassword] = React.useState("Password123!");
  const [message, setMessage] = React.useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("Signing in...");

    try {
      const result = await login({
        userNameOrEmail,
        password
      });

      console.log("Login success:", result);

      saveToken(result.token);
      setMessage(`Login successful. Role: ${result.role ?? "Unknown"}`);
    } catch (error) {
      console.error("Login failed:", error);
      setMessage("Login failed. Check Console and Network tab.");
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        placeholder="Username or email"
        value={userNameOrEmail}
        onChange={(event) => setUserNameOrEmail(event.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button type="submit">Sign In</button>

      {message && (
        <p className={message.includes("successful") ? "success" : "error"}>
          {message}
        </p>
      )}
    </form>
  );
}