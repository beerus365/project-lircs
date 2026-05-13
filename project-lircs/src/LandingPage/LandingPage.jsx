import { useNavigate } from "react-router-dom";

function LandingPage() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/visit-log-entry');
    };

    return (
        <div className="landing-page" onClick={handleClick}>
            <img
                src="/LandingPageLogo.svg"
                alt="Library Logo"
                className="landing-logo"
            />

            <h4 className="landing-title">
                STUDENT KIOSK
            </h4>

            <p className="landing-description">
                Tap anywhere to begin
            </p>
        </div>
    );
}

export default LandingPage;