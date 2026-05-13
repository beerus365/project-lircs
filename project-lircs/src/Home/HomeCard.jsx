function HomeCard() {
    return (
        <>
            <div className="home-card">
                <h2 className="home-card-title">Select Role</h2>

                <div className="home-card-button-group">
                    <button className="home-card-button">
                        <img src="/studentLogo.svg" alt="Student Icon" className="home-card-icon"/>
                        Student
                    </button>
                    <button className="home-card-button">
                        <img src="/teacherLogo.svg" alt="Teacher Icon" className="home-card-icon"/>
                        Teacher
                    </button>
                </div>

                <div className="home-input-section">
                    <h3 className="home-input-title">Student ID</h3>
                    <input type="text" className="home-input-field" placeholder="e.g. 2023-0000" />

                    <h3 className="home-input-title">Purpose</h3>
                    <label className="home-input-dropdown">
                        <select className="home-input-field">
                            <option value="" disabled>
                                Select Purpose
                            </option>
                            
                            <option value="research">Book Borrowing</option>
                            <option value="study">Study</option>
                            <option value="reference">Library Visitation</option>
                        </select>
                    </label>

                </div>

                <button className="home-submit-button">
                    Record Entry
                </button>

            </div>
        </>
    );
}

export default HomeCard;