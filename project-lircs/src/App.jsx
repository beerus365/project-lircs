import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage/LandingPage.jsx";
import VisitLogEntry, {SearchBooks, MyStatusPage} from "./VisitLogEntry.jsx";
import MyStatusMain from "./MyStatus/MyStatusMain.jsx";
import MyStatusLogIn from "./MyStatus/MyStatusLogIn.jsx";
import AdminPageLogIn from "./AdminPage/AdminPageLogIn.jsx";
import AdminPageDashboard from "./AdminPage/AdminPageDashBoard.jsx";
import Circulation from './AdminPage/Circulation.jsx'
import AccessioningPage from "./AdminPage/Accessioning.jsx";
import CatalogingPage from "./AdminPage/Cataloging.jsx";
import WeedingPage from "./AdminPage/Weeding.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/visit-log-entry" element={<VisitLogEntry />} />
                <Route path="/search-books" element={<SearchBooks />} />
                <Route path="/my-status" element={<MyStatusMain />} />
                <Route path="/my-status-login" element={<MyStatusLogIn />} />
                <Route path="/admin-login" element={<AdminPageLogIn />} />
                <Route path="/admin-dashboard" element={<AdminPageDashboard/>} />
                <Route path="/circulation" element={<Circulation/>} />
                <Route path="/accessioning" element={<AccessioningPage/>} />
                <Route path="/cataloging" element={<CatalogingPage/>} />
                <Route path="/weeding" element={<WeedingPage/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;