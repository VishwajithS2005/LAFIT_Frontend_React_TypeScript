import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../stores/AuthStore";
import { useEffect, useState } from "react";

function Intro() {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const authState = useAuthStore.getState();
            
            if (!authState.isAuthenticated || !authState.user || !authState.token) {
                setIsChecking(false);
                return;
            }

            const isTokenValid = await authState.verifyToken();

            if (isTokenValid) {
                const role = authState.user.role;
                if (role === "ADMIN") {
                    navigate("/admin", { replace: true });
                } else if (role === "USER") {
                    navigate("/dashboard", { replace: true });
                }
            } else {
                setIsChecking(false);
            }
        };

        checkSession();
    }, [navigate]);

    if (isChecking) {
        return (
            <div style={{ textAlign: "center", padding: "50px", color: "var(--text-main)" }}>
                <h2>Verifying secure session...</h2>
            </div>
        );
    }

    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h1>Welcome to LAFIT!</h1>
            <p>This is the guest home page.</p>
            <div style={{ gap: "10px", display: "flex", justifyContent: "center" }}>
                <Link to="/login">
                    <button>Go to Login</button>
                </Link>
                <Link to="/register">
                    <button>Go to Register</button>
                </Link>
            </div>
        </div>
    )
}

export default Intro