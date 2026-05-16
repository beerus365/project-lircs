import AdminPageHeader from './AdminPageHeader';
import AdminPageSidebar from './AdminPageSidebar';

function WeedingPage() {
    return (
        <div className="admin-layout">
            <AdminPageHeader />
            <div className="admin-body">     
                <AdminPageSidebar />
                <main className="weeding-content">
                </main>
            </div>
        </div>
    )
}
export default WeedingPage;