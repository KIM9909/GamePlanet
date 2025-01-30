import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/UserSlice";
import boardReducer from "./slices/BoardSlice";
import gameReducer from "./slices/GameSlice";
import tournamentReducer from "./slices/TournamentSlice";
import profileReducer from "./slices/ProfileSlice";
import catchmindReducer from "./slices/CatchMindSlice";
import friendReducer from "./slices/FriendSlice";

// Redux 스토어 생성 및 설정
export const Store = configureStore({
  // 루트 리듀서 설정
  reducer: {
    user: userReducer, // 유저 관련 상태 관리
    board: boardReducer, // 게시판 관련 상태 관리
    game: gameReducer, // 게임 관련 상태 관리
    tournament: tournamentReducer, // 토너먼트 관련 상태 관리
    profile: profileReducer,
    catchmind: catchmindReducer,
    friend: friendReducer,
  },
  // 기본적으로 Redux DevTools와 Redux Thunk가 포함됨
});
