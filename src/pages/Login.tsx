import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { type UserLoginRequest } from "../types/Users"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "../stores/AuthStore";
import { useToastStore } from "../stores/ToastStore";
import ToastContainer from "../components/ToastContainer";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$/;
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (!passwordRegex.test(password)) {
            useToastStore.getState().addToast("Invalid password.", "error");
            return;
        }

        const requestData: UserLoginRequest = {
            username: username,
            password: password
        };

        await login(requestData);
        const authState = useAuthStore.getState();

        if (authState.isAuthenticated && authState.user) {
            if (authState.user.role === "ADMIN") {
                navigate("/admin");
                return;
            } else if (authState.user.role === "USER") {
                navigate("/dashboard");
                return;
            }
        }

        if (authState.error) {
            useToastStore.getState().addToast(`Error: ${authState.error}.`, "error");
            // alert(`Error: ${authState.error}.`);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "50px", maxWidth: "400px", margin: "0 auto" }}>
            <h2>Login</h2>
            <p>Please enter your credentials.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ padding: "8px" }}
                />
                <div style={{ position: "relative", display: "flex" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: "8px", width: "100%", paddingRight: "40px", boxSizing: "border-box" }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                        aria-label="Toggle password visibility"
                        className="icon-btn"
                    >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                </div>
                <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
                    Log In
                </button>
            </form>

            <div style={{ marginTop: "20px" }}>
                <Link to="/">Back to Home</Link>
            </div>
            <ToastContainer />
        </div>
    );
}