import { useNavigate } from "react-router-dom"; 

function LogEntryNav() {

    const navigate = useNavigate();

    const home = "Home";
    const searchBooks = "Search Books";
    const myStatus = "My Status";
    return (
        <div className="log-entry-nav">
            <nav className="nav-log-entry">

                <button className="log-entry-button" onClick={() => navigate('/visit-log-entry')}>
                    <img src="/Home.svg" alt="Home" />
                    {home}
                </button>

                <button className="log-entry-button" onClick={() => navigate('/search-books')}>
                    <img src="/Search.svg" alt="Search" />
                    {searchBooks}
                </button>

                <button className="log-entry-button" onClick={() => navigate('/my-status')}>
                    <img src="/MyStatus.svg" alt="Status" />
                    {myStatus}
                </button>
            </nav>
        </div>
    );
}

export default LogEntryNav;