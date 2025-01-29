// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/admin/AdminPage";
import BoardPage from "./pages/board/BoardPage";
import BurumabulPage from "./pages/game/BurumabulPage";
import GameInfoPage from "./pages/gameInfo/GameInfoPage";
import HomePage from "./pages/home/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProposalPage from "./pages/proposal/ProposalPage";
import TournamentPage from "./pages/tournament/TournamentPage";
import CockroachPokerPage from "./pages/game/CockroachPokerPage";
import MainPage from "./pages/main/MainPage";
import TopLayout from "./components/layout/TopLayout";
import SideLayout from "./components/layout/SideLayout";
import Introduce from "./pages/introduce/Introduce";
import ScrollToTop from "./components/layout/ScrollToTop";
import CatchMindPage from "./pages/game/CatchMindPage";
import WaitingRoom from "./components/game/burumabul/WaitingRoom";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <TopLayout>
        <SideLayout>
          <Routes>
            {/* Admin */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Board */}
            <Route path="/board" element={<BoardPage />} />
            <Route path="/board/:boardId" element={<BoardPage />} />

            {/* Game */}
            <Route path="/game/burumabul/start" element={<BurumabulPage />} />
            <Route
              path="/game/burumabul/waitingroom"
              element={<WaitingRoom />}
            />
            <Route
              path="/game/cockroach/:roomId"
              element={<CockroachPokerPage />}
            />
            <Route path="/catch-mind/:roomId" element={<CatchMindPage />} />

            {/* GameInfo */}
            <Route path="/game/:gameId" element={<GameInfoPage />} />

            {/* Home & Main */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/" element={<MainPage />} />

            {/* Profile */}
            <Route path="/profile/:userId" element={<ProfilePage />} />

            {/* Proposal */}
            <Route path="/proposal" element={<ProposalPage />} />
            <Route path="/proposal/:proposalId" element={<ProposalPage />} />

            {/* Tournament */}
            <Route path="/tournament" element={<TournamentPage />} />
            <Route
              path="/tournament/:tournamentId"
              element={<TournamentPage />}
            />

            {/* INTRODUCE */}
            <Route path="/introduce" element={<Introduce />} />
          </Routes>
        </SideLayout>
      </TopLayout>
    </BrowserRouter>
  );
}

export default App;
