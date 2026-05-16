import AdminPageHeader from './AdminPageHeader';
import AdminPageSidebar from './AdminPageSidebar';

function CirculationPage() {
    return (
        <div className="admin-layout">
            <AdminPageHeader />
            <div className="admin-body">     
                <AdminPageSidebar />
                <main className="circulation-content">
                    <div className='admin-page-title'>
                        <h1>CIRCULATION</h1>
                        <p>Manage borrowing, active loans, and returning</p>
                    </div>

                    <div className='circulation-main-body'>
                        <span className='circulation-header-buttons'>
                            <span className='three-buttons'>
                                <button className='circulation-button'>Pending Request</button>
                                <button className='circulation-button'>Active Borrowing</button>
                                <button className='circulation-button'>Returning</button>
                            </span>
                            <button className='add-borrower-button'>+ Add Borrower</button>
                        </span>

                        <div className='circulation-search-container'>
                            <h3>SEARCH A STUDENT/TEACHER</h3>
                            <span className='circulation-search-bar'>
                                <input className='circulation-search-input' placeholder="Enter Student/Teacher's ID"></input>
                                <button>Look Up</button>
                            </span>
                        </div>
                        <PendingRequestTable></PendingRequestTable>
                    </div>
                </main>
            </div>
        </div>
    )
}

function PendingRequestTable() {
    return (
        <div className='circulation-table-container'>
            <table>
                <thead>
                    <tr>
                        <th>Date Requested</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Book Title</th>
                        <th>Accession No.</th>
                        <th>Call No.</th>
                        <th>Action</th>
                    </tr>
                </thead>
            </table>
        </div>
    )
}
export default CirculationPage;