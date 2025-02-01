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
  roomId: null,
  currentWord: "사과",
  currentRound: 1,
  totalRounds: 5,
  timeLimit: 90,
  players: [], // 빈 배열로 시작
  isGameStarted: false,
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
     * 플레이어 목록을 초기화하거나 업데이트하는 리듀서
     */
    updatePlayers: (state, action) => {
      const { players } = action.payload;
      if (Array.isArray(players)) {
        // 중복 방지를 위해 닉네임을 키로 사용
        const uniquePlayers = [
          ...new Map(
            players.map((player) => [
              player.nickname,
              {
                id: player.id || Math.random().toString(36).substr(2, 9),
                nickname: player.nickname,
                score: player.score || 0,
                isTurn: player.isTurn || false,
                isCurrentUser: player.isCurrentUser || false,
              },
            ])
          ).values(),
        ];

        state.players = uniquePlayers;
      }
    },

    /**
     * 플레이어의 점수를 업데이트하는 리듀서
     */
    updatePlayerScore: (state, action) => {
      const { nickname, score } = action.payload;
      const player = state.players.find((p) => p.nickname === nickname);
      if (player) {
        player.score = score;
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

    /**
     * 방 ID를 설정하는 리듀서
     */
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
  },

  /**
   * 비동기 액션에 대한 리듀서들
   */
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.userStatus.isLoading = true;
        state.userStatus.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.userStatus.isLoading = false;
        // 현재 유저의 닉네임 업데이트
        if (action.payload && state.players.length === 0) {
          state.players = [
            {
              id: 1,
              nickname: action.payload.nickname,
              score: 0,
              isTurn: true,
              isCurrentUser: true,
            },
          ];
        }
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.userStatus.isLoading = false;
        state.userStatus.error = action.payload;
      });
  },
});

// 액션 생성자들을 export
export const {
  updatePlayers,
  updatePlayerScore,
  setCurrentWord,
  updateGameState,
  setRoomId,
  updatePlayerNickname,
} = CatchMindSlice.actions;

// 리듀서를 export
export default CatchMindSlice.reducer;
