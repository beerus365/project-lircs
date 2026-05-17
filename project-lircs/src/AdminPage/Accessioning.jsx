import AdminPageHeader from './AdminPageHeader';
import AdminPageSidebar from './AdminPageSidebar';

function AccessioningPage() {
    return (
        <div className="admin-layout">
            <AdminPageHeader />
            <div className="admin-body">     
                <AdminPageSidebar />
                <main className="accessioning-content">
                    <div className='admin-page-title'>
                        <h1>ACCESSIONING</h1>
                        <p>Register new books into the library collection.</p>
                    </div>
                </main>
            </div>
        </div>
    )
}
export default AccessioningPage;