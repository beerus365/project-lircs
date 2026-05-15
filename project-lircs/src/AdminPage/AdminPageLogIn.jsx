import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderLogEntry from "../Header/HeaderLogEntry";
import LogEntryNav from "../Header/LogEntryNav";

const ADMIN_LOGIN_CREDENTIALS = {
    admin_id: "admin",
    password: "admin123",
    admin_name: "Kimberly Bermoy" 
};

function AdminPageLogIn() {
    const navigate = useNavigate();
    const [adminId, setAdminId] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdminLogin = async () => {
        if (!adminId.trim() || !adminPassword.trim()) {
            setError("Please enter your Admin ID and password.");
            return;
        }

        setLoading(true);
        setError("");
        await new Promise(resolve => setTimeout(resolve, 500));

        if (
            adminId.trim() === ADMIN_LOGIN_CREDENTIALS.admin_id &&
            adminPassword.trim() === ADMIN_LOGIN_CREDENTIALS.password
        ) {
            setLoading(false);
            navigate("/admin-dashboard", { state: { adminName: ADMIN_LOGIN_CREDENTIALS.admin_name } });
        } else {
            setError("Invalid Admin ID or password. Please try again.");
            setLoading(false);
        }
    };

    return (
    
    <>
        <HeaderLogEntry />
        <LogEntryNav />

        <div className="admin-login-wrapper">
            <main className="admin-login-container">
                <img src='/BookAdminLogo.svg' alt="Book-Logo"></img>
                <h2 className="admin-login-label">Admin Login</h2>

                <div className="admin-input-container">
                    <input
                        className="admin-input"
                        type="text"
                        placeholder="Enter Admin ID"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        disabled={loading}
                    />

                    <input 
                        className="admin-input"
                        type="password" 
                        placeholder="Enter Password" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}  
                        disabled={loading}
                    />
                </div>

                <button className="admin-login-button" onClick={handleAdminLogin} disabled={loading}>
                    {loading ? "Logging in..." : "Log In"}
                </button>
                {error && <p className="error-message">{error}</p>}
            </main>
        </div>

    </>
    );
}

export default AdminPageLogIn;