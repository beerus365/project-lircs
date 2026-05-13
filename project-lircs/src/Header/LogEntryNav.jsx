function LogEntryNav() {

    const home = "Home";
    const searchBooks = "Search Books";
    const myStatus = "My Status";
    return (
        <div className="log-entry-nav">
            <nav className="nav-log-entry">

                <button className="log-entry-button">
                    <img src="/Home.svg" alt="Home" />
                    {home}
                </button>

                <button className="log-entry-button">
                    <img src="/Search.svg" alt="Search" />
                    {searchBooks}
                </button>

                <button className="log-entry-button">
                    <img src="/MyStatus.svg" alt="Status" />
                    {myStatus}
                </button>
            </nav>

            <span>
                
            </span>
            
        </div>
    );
}

export default LogEntryNav;