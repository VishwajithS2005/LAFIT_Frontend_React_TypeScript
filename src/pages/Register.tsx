import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { UserRegister } from "../types/Users";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "../stores/AuthStore";


export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$/;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuthStore();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        
        if(password !== confirmPassword || !passwordRegex.test(password)) {
            alert("Invalid Password.");
            return;
        }
        
        const requestData: UserRegister = {
            username: username,
            password: password,
            email: email
    };

        console.log("Sending registration request:", requestData);
        await register(requestData);

        const authState = useAuthStore.getState();

        if(authState.user) {
            navigate("/login");
            return;
        }

        if(authState.error) {
            alert(`Error: ${authState.error}.`);
            console.log(`Error: ${authState.error}.`);
            return;
        }
    };

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
                <div style={{ position: "relative", display: "flex" }}>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ padding: "8px", width: "100%", paddingRight: "40px", boxSizing: "border-box" }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                        aria-label="Toggle confirm password visibility"
                        className="icon-btn"
                    >
                        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                </div>
                <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
                    Sign Up
                </button>
            </form>

            <div style={{ marginTop: "20px" }}>
                <Link to="/">Back to Home</Link>
            </div>
        </div>
    );
}