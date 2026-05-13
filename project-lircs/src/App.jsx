import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage/LandingPage.jsx";
import VisitLogEntry, {SearchBooks, MyStatusPage} from "./VisitLogEntry.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/visit-log-entry" element={<VisitLogEntry />} />
                <Route path="/search-books" element={<SearchBooks />} />
                <Route path="/my-status" element={<MyStatusPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;