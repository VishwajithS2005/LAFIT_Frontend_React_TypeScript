import React, { useState } from 'react';
import { useAuthStore } from '../stores/AuthStore';
import { useUserStore } from '../stores/UserStore';
import { useNavigate } from 'react-router-dom';
import ToastContainer from '../components/ToastContainer';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import '../App.css';

export default function Settings() {
    const { user, logout } = useAuthStore();
    const { updateProfile, deleteSelf } = useUserStore();
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        if (!user) return;

        setIsSubmitting(true);
        const success = await updateProfile(user.id, {
            oldPassword: oldPassword,
            newPassword: newPassword
        });
        setIsSubmitting(false);

        if (success) {
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            logout();
            navigate('/login');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("WARNING: This action is irreversible. All of your items and claims will be lost. Are you absolutely sure you want to delete your account?");

        if (confirmed) {
            const success = await deleteSelf();
            if (success) {
                logout();
                navigate('/login');
            }
        }
    };

    return (
        <>
            <div className="page-container" style={{ paddingBottom: '40px' }}>
                <h2>Account Settings</h2>
                <p>Change your password below.</p>

                <form onSubmit={handleSubmit} className="form-group">
                    <div className="input-wrapper">
                        <div style={{ position: "relative", display: "flex", width: "100%" }}>
                            <input
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Current Password"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                required
                                style={{ width: "100%", paddingRight: "40px", boxSizing: "border-box" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                                aria-label="Toggle password visibility"
                                className="icon-btn"
                            >
                                {showOldPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>
                    </div>

                    <div className="input-wrapper">
                        <div style={{ position: "relative", display: "flex", width: "100%" }}>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                style={{ width: "100%", paddingRight: "40px", boxSizing: "border-box" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                                aria-label="Toggle new password visibility"
                                className="icon-btn"
                            >
                                {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>
                    </div>

                    <div className="input-wrapper">
                        <div style={{ position: "relative", display: "flex", width: "100%" }}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                style={{ width: "100%", paddingRight: "40px", boxSizing: "border-box" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                                aria-label="Toggle confirm password visibility"
                                className="icon-btn"
                            >
                                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>
                    </div>

                    <div className="button-group" style={{ flexDirection: 'column', gap: '12px' }}>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Password"}
                        </button>
                        <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
                            Go Back
                        </button>
                    </div>
                </form>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '32px 0' }} />

                <div style={{ border: '1px solid #ef4444', padding: '24px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                    <h3 style={{ color: '#ef4444', marginTop: 0, marginBottom: '8px' }}>Danger Zone</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 16px 0' }}>
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                        type="button"
                        onClick={handleDeleteAccount}
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                    >
                        Delete My Account
                    </button>
                </div>

            </div>
            <ToastContainer />
        </>
    );
}