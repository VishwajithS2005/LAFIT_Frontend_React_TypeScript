import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { UserRegister } from "../types/Users";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import { useAuthStore } from "../stores/AuthStore";
import { useToastStore } from "../stores/ToastStore";
import ToastContainer from "../components/ToastContainer";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isConfirmFocused, setIsConfirmFocused] = useState(false);

    const navigate = useNavigate();
    const { register } = useAuthStore();

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const hasValidLength = password.length >= 8 && password.length <= 20;

    const isPasswordValid = hasLower && hasUpper && hasNumber && hasSpecial && hasValidLength;
    const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isPasswordValid || !isConfirmValid) {
            useToastStore.getState().addToast("Please ensure all password conditions are met.", "error");
            return;
        }

        const requestData: UserRegister = {
            username: username,
            password: password,
            email: email
        };

        await register(requestData);

        const authState = useAuthStore.getState();

        if (authState.user) {
            navigate("/login");
            return;
        }

        if (authState.error) {
            useToastStore.getState().addToast(`Error: ${authState.error}`, "error");
            return;
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div style={{ textAlign: "center", padding: "50px", maxWidth: "400px", margin: "0 auto" }}>
            <h2>Register</h2>
            <p>Create a new account.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ padding: "8px" }}
                />
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: "8px" }}
                />

                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ position: "relative", display: "flex" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            required
                            style={{
                                padding: "8px",
                                width: "100%",
                                paddingRight: "40px",
                                boxSizing: "border-box",
                                outline: "none",
                                // Only apply inline border coloring when focused. 
                                // When undefined, it defaults to your global CSS matching Login.tsx!
                                border: isPasswordFocused
                                    ? (password.length === 0 ? "2px solid #007bff" : (isPasswordValid ? "2px solid #22c55e" : "2px solid #ef4444"))
                                    : undefined
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#666" }}
                            aria-label="Toggle password visibility"
                            className="icon-btn"
                        >
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    {isPasswordFocused && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px", fontSize: "12px", color: "#555", marginTop: "4px", paddingLeft: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: hasValidLength ? "#22c55e" : "#ef4444" }}>
                                {hasValidLength ? <FaCheck /> : <FaTimes />} <span>8 - 20 characters</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: hasLower ? "#22c55e" : "#ef4444" }}>
                                {hasLower ? <FaCheck /> : <FaTimes />} <span>At least one lowercase letter (a-z)</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: hasUpper ? "#22c55e" : "#ef4444" }}>
                                {hasUpper ? <FaCheck /> : <FaTimes />} <span>At least one uppercase letter (A-Z)</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: hasNumber ? "#22c55e" : "#ef4444" }}>
                                {hasNumber ? <FaCheck /> : <FaTimes />} <span>At least one number (0-9)</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: hasSpecial ? "#22c55e" : "#ef4444" }}>
                                {hasSpecial ? <FaCheck /> : <FaTimes />} <span>At least one special character (!@#$%^&*)</span>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ position: "relative", display: "flex" }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setIsConfirmFocused(true)}
                            onBlur={() => setIsConfirmFocused(false)}
                            required
                            style={{
                                padding: "8px",
                                width: "100%",
                                paddingRight: "40px",
                                boxSizing: "border-box",
                                outline: "none",
                                border: isConfirmFocused
                                    ? (confirmPassword.length === 0 ? "2px solid #007bff" : (isConfirmValid ? "2px solid #22c55e" : "2px solid #ef4444"))
                                    : undefined
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#666" }}
                            aria-label="Toggle confirm password visibility"
                            className="icon-btn"
                        >
                            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    {confirmPassword.length > 0 && !isConfirmValid && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ef4444", fontSize: "12px", paddingLeft: "4px" }}>
                            <FaTimes /> <span>Passwords do not match</span>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    style={{
                        padding: "10px",
                        cursor: (!isPasswordValid || !isConfirmValid) ? "not-allowed" : "pointer",
                        opacity: (!isPasswordValid || !isConfirmValid) ? 0.7 : 1
                    }}
                    disabled={!isPasswordValid || !isConfirmValid}
                >
                    Sign Up
                </button>
            </form>

            <div style={{ marginTop: "20px" }}>
                <Link to="/">Back to Home</Link>
            </div>

            <ToastContainer />
        </div>
    );
}