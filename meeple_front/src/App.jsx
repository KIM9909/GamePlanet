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
import { Store } from "./sources/api/store/Store";
import { Provider } from "react-redux";
import MainPage from "./pages/main/MainPage";
import TopLayout from "./components/layout/TopLayout";

function App() {
  return (
    <Provider store={Store}>
      <BrowserRouter>
        <TopLayout>
          <Routes>
            {/* Admin */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Board */}
            <Route path="/board" element={<BoardPage />} />
            <Route path="/board/:boardId" element={<BoardPage />} />

            {/* Game */}
            <Route path="/game/burumabul" element={<BurumabulPage />} />
            <Route
              path="/game/cockroachpoker"
              element={<CockroachPokerPage />}
            />

            {/* GameInfo */}
            <Route path="/game/:gameId" element={<GameInfoPage />} />

            {/* Home & Main */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/" element={<MainPage />} />

            {/* Profile */}
            <Route path="/profile" element={<ProfilePage />} />
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
          </Routes>
        </TopLayout>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
