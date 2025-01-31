import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserAPI } from "../../api/UserAPI";

/**
 * 유저 프로필 정보를 가져오는 비동기 액션 생성자
 * @param userId - 유저 ID
 * @returns {Promise} - 프로필 정보를 담은 Promise 객체
 */
export const fetchUserInfo = createAsyncThunk(
  "catchmind/fetchUserInfo",
  async (userId, { rejectWithValue }) => {
    try {
      const profile = await UserAPI.getProfile(userId);
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  roomId: "1",
  currentWord: "사과",
  currentRound: 1,
  totalRounds: 5,
  timeLimit: 90,
  players: [
    // 첫 번째 플레이어는 현재 유저
    { id: 1, nickname: "", score: 0, isTurn: true, isCurrentUser: true },
    // 나머지는 다른 플레이어들
    {
      id: 2,
      nickname: "player2",
      score: 0,
      isTurn: false,
      isCurrentUser: false,
    },
    {
      id: 3,
      nickname: "player3",
      score: 0,
      isTurn: false,
      isCurrentUser: false,
    },
    {
      id: 4,
      nickname: "player4",
      score: 0,
      isTurn: false,
      isCurrentUser: false,
    },
  ],
  isGameStarted: true,
  userStatus: {
    isLoading: false,
    error: null,
  },
};

/**
 * 캐치마인드 Redux Slice
 * 게임 상태 관리를 위한 리듀서와 액션 생성자 포함
 */
const CatchMindSlice = createSlice({
  name: "catchmind",
  initialState,
  reducers: {
    /**
     * 플레이어의 닉네임을 업데이트하는 리듀서
     * @param {Object} state - 현재 상태
     * @param {Object} action - playerId와 nickname을 포함한 액션 객체
     */
    updatePlayerNickname: (state, action) => {
      const { playerId, nickname } = action.payload;
      const player = state.players.find((p) => p.id === playerId);
      if (player) {
        player.nickname = nickname;
      }
    },

    /**
     * 현재 제시어를 설정하는 리듀서
     */
    setCurrentWord: (state, action) => {
      state.currentWord = action.payload;
    },

    /**
     * 게임 전체 상태를 업데이트하는 리듀서
     */
    updateGameState: (state, action) => {
      return { ...state, ...action.payload };
    },
  },

  /**
   * 비동기 액션에 대한 리듀서들
   */
  extraReducers: (builder) => {
    builder
      // fetchUserInfo 액션이 시작될 때
      .addCase(fetchUserInfo.pending, (state) => {
        state.userStatus.isLoading = true;
        state.userStatus.error = null;
      })
      // fetchUserInfo 액션이 성공했을 때
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.userStatus.isLoading = false;
        // 현재 유저(첫 번째 플레이어)의 닉네임 설정
        const currentPlayer = state.players[0];
        if (currentPlayer && action.payload) {
          currentPlayer.nickname = action.payload.nickname;
        }
      })
      // fetchUserInfo 액션이 실패했을 때
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.userStatus.isLoading = false;
        state.userStatus.error = action.payload;
      });
  },
});

// 액션 생성자들을 export
export const {
  updateScore,
  setCurrentWord,
  updateGameState,
  updatePlayerNickname,
} = CatchMindSlice.actions;

// 리듀서를 export
export default CatchMindSlice.reducer;
