// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/admin/AdminPage";
import BoardPage from "./pages/gameInfo/board/BoardPage";
import BurumabulPage from "./pages/game/BurumabulPage"
import GameInfoPage from "./pages/gameInfo/GameInfoPage";
import HomePage from "./pages/home/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProposalPage from "./pages/proposal/ProposalPage";
import CockroachPokerPage from "./pages/game/CockroachPokerPage";
import MainPage from "./pages/main/MainPage";
import TopLayout from "./components/layout/TopLayout";
import SideLayout from "./components/layout/SideLayout";
import Introduce from "./pages/introduce/Introduce";
import ScrollToTop from "./components/layout/ScrollToTop";
import CatchMindPage from "./pages/game/CatchMindPage";
import FriendModalLayout from "./components/layout/FriendModalLayout";
import CatchMindListPage from "./components/game/catchMind/roomList/CatchMindListPage";

import NewArticlePage from "./pages/gameInfo/board/NewArticlePage";
import GameRulePage from "./pages/gameInfo/GameRulePage";
import ArticleDetailPage from "./pages/gameInfo/board/ArticleDetailPage";
import ReviewPage from "./pages/gameInfo/ReviewPage";
import GameVideoPage from "./pages/gameInfo/GameVideoPage";

import CockroachRoom from "./components/game/cockroachcard/CockroachRoom";
import BurumabulRoomListPage from "./pages/game/burumabul/BurumabulRoomListPage";
import SocketLayout from "./components/layout/SocketLayout";

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
              path="/game/burumabul/start/:roomId"
              element={
                <SocketLayout>
                  <BurumabulPage />
                </SocketLayout>
              }
            />
            <Route
              path="/burumabul/room-list"
              element={
                <SocketLayout>
                  <BurumabulRoomListPage />
                </SocketLayout>
              }
            />


              {/* GameInfo */}
              <Route path="/game/:gameInfoId/info" element={<GameInfoPage />} />
              <Route path="/game/:gameInfoId/rule" element={<GameRulePage />} />
              <Route path="/game/:gameInfoId/board" element={<BoardPage />} />
              <Route path="/game/:gameInfoId/board/write" element={<NewArticlePage />} />
              <Route path="/game/:gameInfoId/board/detail/:articleId" element={<ArticleDetailPage />} />
              <Route path="/game/:gameInfoId/board/edit/:articleId" element={<ArticleDetailPage />} />
              <Route path="/game/:gameInfoId/review" element={<ReviewPage />} />
              <Route path="/game/:gameInfoId/video" element={<GameVideoPage />} />

            <Route
              path="/game/cockroach/:roomId"
              element={<CockroachPokerPage />}
            />
            <Route path="/catch-mind/:roomId" element={<CatchMindPage />} />
            <Route path="/catch-mind" element={<CatchMindListPage />} />


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

            {/* INTRODUCE */}
            <Route path="/introduce" element={<Introduce />} />

            {/* Cockroach Room List */}
            <Route path="/test/cockroach" element={<CockroachRoom />} />

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
