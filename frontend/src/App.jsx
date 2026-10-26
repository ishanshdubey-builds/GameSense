
import ValorantProfilePage from "./pages/ValorantProfilePage";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="GameSense home">
          <span className="brand-mark">G</span>
          <span>
            GAME<span className="brand-accent">SENSE</span>
          </span>
        </a>

        <div className="topbar-label">
          <span className="live-dot" />
          VALORANT TRACKER
        </div>
      </header>

      <main className="main-content">
        <ValorantProfilePage />
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
