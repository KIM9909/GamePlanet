// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/admin/AdminPage";
import BoardPage from "./pages/gameInfo/board/BoardPage";
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
import WaitingRoom from "./components/game/burumabul/waiting/WaitingRoom";
import FriendModalLayout from "./components/layout/FriendModalLayout";
import CatchMindListPage from "./components/game/catchMind/roomList/CatchMindListPage";
import NewArticlePage from "./pages/gameInfo/board/NewArticlePage";
import GameRulePage from "./pages/gameInfo/GameRulePage";
import ArticleDetailPage from "./pages/gameInfo/board/ArticleDetailPage";
import ReviewPage from "./pages/gameInfo/ReviewPage";
import GameVideoPage from "./pages/gameInfo/GameVideoPage";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <TopLayout>
        {/* <SideLayout> */}
          <FriendModalLayout>
            <Routes>
              {/* Admin */}
              <Route path="/admin" element={<AdminPage />} />

              {/* Board */}
              <Route path="/board" element={<BoardPage />} />
              <Route path="/board/:boardId" element={<BoardPage />} />

              {/* Game */}
              <Route
                // path="/game/burumabul/start"
                path="/game/burumabul/start/:roomId"
                element={<BurumabulPage />}
              />
              <Route
                // path="/game/burumabul/waitingroom/"
                path="/game/burumabul/waitingroom/:roomId"
                element={<WaitingRoom />}
              />
              <Route
                path="/game/cockroach/:roomId"
                element={<CockroachPokerPage />}
              />
              <Route path="/catch-mind/:roomId" element={<CatchMindPage />} />
              <Route path="/catch-mind" element={<CatchMindListPage />} />

              {/* GameInfo */}
              <Route path="/game/:gameId/info" element={<GameInfoPage />} />
              <Route path="/game/:gameId/rule" element={<GameRulePage />} />
              <Route path="/game/:gameId/board" element={<BoardPage />} />
              <Route path="/game/:gameId/board/write" element={<NewArticlePage />} />
              <Route path="/game/:gameId/board/detail/:articleId" element={<ArticleDetailPage />} />
              <Route path="/game/:gameId/board/edit/:articleId" element={<ArticleDetailPage />} />
              <Route path="/game/:gameId/review" element={<ReviewPage />} />
              <Route path="/game/:gameId/video" element={<GameVideoPage />} />

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
          </FriendModalLayout>
        {/* </SideLayout> */}
      </TopLayout>
    </BrowserRouter>
  );
}

export default App;
