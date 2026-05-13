import HeaderLogEntry from "./Header/HeaderLogEntry.jsx";
import LogEntryNav from "./Header/LogEntryNav.jsx";
import Home from "./Home/Home.jsx";

function App() {
    return (
        <div className="app-layout">
            <HeaderLogEntry />
            <LogEntryNav />
            <Home />
        </div>
    );
}
export default App
