import AdminPageHeader from './AdminPageHeader';
import AdminPageSidebar from './AdminPageSidebar';

function CatalogingPage() {
    return (
        <div className="admin-layout">
            <AdminPageHeader />
            <div className="admin-body">     
                <AdminPageSidebar />
                <main className="cataloging-content">
                </main>
            </div>
        </div>
    )
}
export default CatalogingPage;