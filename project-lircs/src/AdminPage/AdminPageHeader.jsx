function AdminPageHeader({ adminName }) {
  return (
    <div className="header-wrapper">
      <header className="header-container">
        <img src='/LogEntryLogo.svg' alt="Header Logo" />

        <div className="admin-profile-container">
          <img src='/AdminProfileLogo.svg' alt="Admin Profile Logo" className="admin-profile-logo" />

          <div className="admin-profile-info">
            <h3 id="admin-profile-label">Admin Profile</h3>
            <h3 id="admin-profile-name">{adminName}</h3>
          </div>

        </div>
      </header>
    </div>
  );
}

export default AdminPageHeader;