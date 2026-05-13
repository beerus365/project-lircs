import CurrentDate from "../Date";
import HomeCard from "./HomeCard";
import HomeTable from "./HomeTable";

function Home() {

    return (
        <main className="home">
            <div className="title-purpose">
                <img src="/visitEntryLog.svg" alt="Library Purpose" className="library-purpose"/>
                <h2 className="library-purpose-text">VISIT ENTRY LOG</h2>
                <CurrentDate />
            </div>

            <div className="home-content">
                <HomeCard />
                <HomeTable />
            </div>
        </main>
    );
}

export default Home;