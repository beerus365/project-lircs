import AdminPageHeader from './AdminPageHeader';
import AdminPageSidebar from './AdminPageSidebar';

function AccessioningPage() {
    return (
        <div className="admin-layout">
            <AdminPageHeader />
            <div className="admin-body">     
                <AdminPageSidebar />
                <main className="accessioning-content">
                </main>
            </div>
        </div>
    )
}
export default AccessioningPage;