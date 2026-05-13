import { useNavigate } from "react-router-dom";

function MyStatusLogIn() {
    const navigate = useNavigate();

    return (
        <div className="my-status-login-container">
            <img src='/ProfilePic.svg' alt='Profile Icon' className='profile-icon' />
            <h2 className='title'>Enter Student ID</h2>
            <p className='my-status-login-prompt'>No password needed — quick lookup only.</p>

            <label htmlFor='student-id-input' className='student-id-label'>Student ID Number</label>
            <input
                id='student-id-input'
                type='text'
                placeholder='e.g. 2023-0000'
                className='student-id-input'
            />
            <button className='my-status-login-button'>View My Status</button>
        </div>
    );
}