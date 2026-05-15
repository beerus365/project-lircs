import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../client/databaseClient";
import HeaderLogEntry from "../Header/HeaderLogEntry";
import LogEntryNav from "../Header/LogEntryNav";

function MyStatusLogIn() {
    const navigate = useNavigate();
    const [studentId, setStudentId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleViewStatus = async () => {
    console.log("1. Button clicked, studentId:", studentId);

    if (!studentId.trim()) {
        setError("Please enter your Student ID.");
        return;
    }

    setLoading(true);
    setError("");

    console.log("2. About to query Supabase...");

    // supabase queries
    const { data, error: dbError } = await supabase
        .from("user")          
        .select("*")
        .eq("user_id", studentId.trim())
        .single();

        console.log("3. Query done. data:", data, "error:", dbError);

    if (dbError || !data) {
        setError("Student ID not found. Please check and try again.");
        console.error("Database error:", dbError); 
        setLoading(false);
        return;
    }

    const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", studentId.trim())
        .single();

    console.log("4. Student data:", studentData, "error:", studentError);

    setLoading(false);

        navigate("/my-status", { state: { student: data, studentInfo: studentData } });
    };

    return (
    
    <>
        <HeaderLogEntry />
        <LogEntryNav />
        
        <div className="my-status-page">
            <div className="my-status-login-container">
                <img src="/ProfilePic.svg" alt="Profile Icon" className="profile-icon" />
                <h2 className="title">Enter Student ID</h2>
                <p className="my-status-login-prompt">No password needed — quick lookup only.</p>
                <label htmlFor="student-id-input" className="student-id-label">
                Student ID Number
                </label>
                <input
                id="student-id-input"
                type="text"
                placeholder="e.g. 2023-0000"
                className="student-id-input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleViewStatus()}
                />
                {error && <p className="error-message">{error}</p>}
                <button
                className="my-status-login-button"
                onClick={handleViewStatus}
                disabled={loading}
                >
                {loading ? "Checking..." : "View My Status"}
                </button>
            </div>
        </div>
    </>
    );
}

export default MyStatusLogIn;