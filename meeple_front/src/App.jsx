// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/admin/AdminPage";
import BoardPage from "./pages/gameInfo/board/BoardPage";
import BurumabulPage from "./pages/game/burumabul/BurumabulPage";
import GameInfoPage from "./pages/gameInfo/GameInfoPage";
import HomePage from "./pages/home/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import CustomPage from "./pages/proposal/CustomPage";
import CockroachPokerPage from "./pages/game/CockroachPokerPage";
import MainPage from "./pages/main/MainPage";
import TopLayout from "./components/layout/TopLayout";
import SideLayout from "./components/layout/SideLayout";
import Introduce from "./pages/introduce/Introduce";
import ScrollToTop from "./components/layout/ScrollToTop";
import CatchMindPage from "./pages/game/CatchMindPage";
import FriendModalLayout from "./components/layout/FriendModalLayout";
import CatchMindListPage from "./components/game/catchMind/roomList/CatchMindListPage";
import GameRulePage from "./pages/gameInfo/GameRulePage";
import ArticleDetailPage from "./pages/gameInfo/board/ArticleDetailPage";
import ReviewPage from "./pages/gameInfo/ReviewPage";

import CockroachRoom from "./components/game/cockroachcard/CockroachRoom";
import BurumabulRoomListPage from "./pages/game/burumabul/BurumabulRoomListPage";
import SocketLayout from "./components/layout/SocketLayout";
import FriendSocketLayout from "./components/layout/FriendSocketLayout";
import FallingStars from "./components/background/FallingStars";

import ErrorPage from "./pages/error/ErrorPage";
import CustomEditor from "./components/info/gamecustom/CustomEditor";
import BackGroundMusic from "./components/background/BackGroundMusic";
import CustomDetail from "./components/info/gamecustom/CustomDetail";
import ReportDetail from "./components/admin/report/ReportDetail";
import RecordDetail from "./components/admin/record/RecordDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastClassName={() =>
          'relative flex p-4 min-h-10 rounded-lg justify-between overflow-hidden cursor-pointer bg-zinc-900 border border-zinc-700/50 backdrop-blur-sm'
        }
        bodyClassName={() =>
          'text-sm font-noto text-white'
        }
        progressClassName={() =>
          'Toastify__progress-bar--animated Toastify__progress-bar--dark bg-cyan-500'
        }
      />
      <BackGroundMusic />
      <FriendSocketLayout>
        <TopLayout>
          <SideLayout>
            <FallingStars />
            <FriendModalLayout>
              <Routes>
                {/* Admin */}
                <Route path="/admin" element={<AdminPage />} />
                <Route
                  path="/admin/report/:reportId"
                  element={<ReportDetail />}
                />
                <Route
                  path="/admin/record/:recordId"
                  element={<RecordDetail />}
                />

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
                <Route
                  path="/game-info/:gameInfoId"
                  element={<GameInfoPage />}
                />
                <Route
                  path="/game-info/:gameInfoId/rule"
                  element={<GameRulePage />}
                />
                <Route
                  path="/game-info/:gameInfoId/board"
                  element={<BoardPage />}
                />
                <Route
                  path="/game-info/:gameInfoId/board/detail/:gameCommunityId"
                  element={<ArticleDetailPage />}
                />
                <Route
                  path="/game-info/:gameInfoId/review"
                  element={<ReviewPage />}
                />

                <Route path="/catch-mind/:roomId" element={<CatchMindPage />} />
                <Route path="/catch-mind" element={<CatchMindListPage />} />

                {/* Home & Main */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/" element={<MainPage />} />

                {/* GameInfo */}
                <Route path="/game/:gameId" element={<GameInfoPage />} />

                {/* Profile */}
                <Route path="/profile/:userId" element={<ProfilePage />} />

                {/* custom */}
                <Route
                  path="/game-info/:gameInfoId/custom"
                  element={<CustomPage />}
                />
                <Route
                  path="/game-info/:gameInfoId/custom/editor"
                  element={<CustomEditor />}
                />
                <Route
                  path="/game-info/:gameInfoId/custom/detail/:customId"
                  element={<CustomDetail />}
                />

                {/* Cockroach Room List */}
                <Route path="/cockroach/room-list" element={<CockroachRoom />} />
                <Route path="/cockroach/:roomId" element={<CockroachPokerPage />} />

                {/* INTRODUCE */}
                <Route path="/introduce" element={<Introduce />} />

                {/* ERROR */}
                <Route path="/errorpage" element={<ErrorPage />} />

                {/* etc */}
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </FriendModalLayout>
          </SideLayout>
        </TopLayout>
      </FriendSocketLayout>
    </BrowserRouter>
  );
}

export default App;
