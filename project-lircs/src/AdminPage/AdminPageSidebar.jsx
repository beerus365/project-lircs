import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPageSidebar() {
    const navigate = useNavigate();

    return(
        <div className="sidebar-wrapper">
            <aside className="sidebar-container">
                <h1 className="sidebar-label">MAIN</h1>

                <div className="sidebar-buttons">
                    <button className="inner-sidebar-button" onClick={() => navigate("/admin-dashboard")}>
                        <img src='/DashboardLogo.svg' alt="Dashboard Logo" className="sidebar-button-logo"></img>
                        <h2 className="sidebar-button-name">DASHBOARD</h2>
                    </button>

                    <button className="inner-sidebar-button" onClick={() => navigate("/circulation")}>
                        <img src='/CirculationLogo.svg' alt="Circulation Logo" className="sidebar-button-logo"></img>
                        <h2 className="sidebar-button-name">CIRCULATION</h2>
                    </button>
                </div>

                <h1 className="sidebar-label">COLLECTION</h1>

                <div className="sidebar-buttons">
                    <button className="inner-sidebar-button" onClick={() => navigate("/accessioning")}>
                        <img src='/AccessioningLogo.svg' alt="Accessioning Logo" className="sidebar-button-logo"></img>
                        <h2 className="sidebar-button-name">ACCESSIONING</h2>
                    </button>

                    <button className="inner-sidebar-button" onClick={() => navigate("/cataloging")}>
                        <img src='/CatalogingLogo.svg' alt="Cataloging Logo" className="sidebar-button-logo"></img>
                        <h2 className="sidebar-button-name">CATALOGING</h2>
                    </button>

                    <button className="inner-sidebar-button" onClick={() => navigate("/weeding")}>
                        <img src='/WeedingLogo.svg' alt="Weeding Logo" className="sidebar-button-logo"></img>
                        <h2 className="sidebar-button-name">WEEDING</h2>
                    </button>
                </div>

                <h1 className="sidebar-label">PEOPLE</h1>

                <div className="sidebar-buttons">
                    <button className="inner-sidebar-button">
                        <img src='/StudentRecordsLogo.svg' alt="Student Records Logo" className="sidebar-button-logo"></img>
                        <h2 className="sidebar-button-name">STUDENT RECORDS</h2>
                    </button>
                </div>

                <button className="sidebar-logout-button" onClick={() => navigate('/admin-login')}>Log Out</button>

            </aside>
        </div>
    )
}

export default AdminPageSidebar;