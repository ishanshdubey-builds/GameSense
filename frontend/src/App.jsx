
import { Link, Route, Routes } from "react-router-dom";
import ValorantProfilePage from "./pages/ValorantProfilePage";
import MatchDetailPage from "./pages/MatchDetailPage";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="GameSense home">
          <span className="brand-mark">G</span>
          <span>
            GAME<span className="brand-accent">SENSE</span>
          </span>
        </Link>

        <div className="topbar-label">
          <span className="live-dot" />
          VALORANT TRACKER
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<ValorantProfilePage />} />
          <Route path="/match/:matchId" element={<MatchDetailPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <span>
          GAME<span className="brand-accent">SENSE</span>
        </span>
        <span>PLAYER DATA · PERFORMANCE · PROGRESS</span>
      </footer>
    </div>
  );
}

export default App;
