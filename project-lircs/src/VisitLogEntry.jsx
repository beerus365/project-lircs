import HeaderLogEntry from "./Header/HeaderLogEntry.jsx"
import LogEntryNav from "./Header/LogEntryNav.jsx"
import Home from "./Home/Home.jsx"
import SearchBooksMain from "./SearchBooks/SearchBooksMain.jsx"
import MyStatusLogIn from "./MyStatus/MyStatusLogIn.jsx"

function VisitLogEntry() {
    return (
        <>
            <HeaderLogEntry />
            <LogEntryNav />
            <Home />
        </>
    )
}

export function SearchBooks() {
    return (
        <>
            <HeaderLogEntry />
            <LogEntryNav />
            <SearchBooksMain />
        </>
    )
}

export function MyStatusPage() {
    return (
        <>
            <HeaderLogEntry />
            <LogEntryNav />
            <MyStatusLogIn />
        </>
    )
}

export default VisitLogEntry; 