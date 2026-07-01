import React from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../authContext/AuthContext";

export function LoginForm() {
    const [userNameOrEmail, setUserNameOrEmail] = React.useState("admin");
    const [password, setPassword] = React.useState("Password123!");
    const [message, setMessage] = React.useState("");
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("Signing in...");

        try {
            const result = await login({
                userNameOrEmail,
                password
            });

            loginUser(result.token);

            setMessage(`Login successful. Role: ${result.role ?? "Unknown"}`);

            const role = String(result.role ?? "").toLowerCase();

            if (role === "analyst") {
                navigate("/accounts");
            } else {
                navigate("/");
            }


        } catch (error) {
            console.error("Login failed:", error);
            setMessage("Login failed. Check username/email and password.");
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