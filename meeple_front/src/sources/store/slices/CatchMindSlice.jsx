import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserAPI } from "../../api/UserAPI";

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
  players: [],
  isGameStarted: false,
  currentTurnIndex: 0, // 추가: 현재 턴 인덱스
  userStatus: {
    isLoading: false,
    error: null,
  },
};

const CatchMindSlice = createSlice({
  name: "catchmind",
  initialState,
  reducers: {
    // 기존 리듀서들은 그대로 유지...
    updatePlayerNickname: (state, action) => {
      const { playerId, nickname } = action.payload;
      const player = state.players.find((p) => p.id === playerId);
      if (player) {
        player.nickname = nickname;
      }
    },

    updatePlayers: (state, action) => {
      const { players } = action.payload;
      if (Array.isArray(players)) {
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

    // 수정: 점수 업데이트 로직 개선
    updatePlayerScore: (state, action) => {
      console.log("Updating player score - Action Payload:", action.payload);

      const { nickname, score } = action.payload;

      // players 배열을 map으로 순회하며 불변성 유지
      state.players = state.players.map((player) => {
        if (player.nickname === nickname) {
          console.log("Player found:", player);
          console.log("Current score:", player.score);
          console.log("Score to add:", score);

          const newScore = (player.score || 0) + score;
          console.log("New score:", newScore);

          return {
            ...player,
            score: newScore,
          };
        }
        return player;
      });

      console.log("Updated players:", state.players);
    },

    // 추가: 턴 변경 리듀서
    nextTurn: (state) => {
      // 현재 턴인 플레이어의 턴을 끝내고 다음 플레이어로 넘김
      const currentTurnPlayer = state.players.find((p) => p.isTurn);
      if (currentTurnPlayer) {
        currentTurnPlayer.isTurn = false;
      }

      // 다음 플레이어 인덱스 계산
      state.currentTurnIndex =
        (state.currentTurnIndex + 1) % state.players.length;

      // 다음 플레이어의 턴으로 설정
      state.players[state.currentTurnIndex].isTurn = true;
    },

    setCurrentWord: (state, action) => {
      state.currentWord = action.payload;
    },

    updateGameState: (state, action) => {
      return { ...state, ...action.payload };
    },

    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 기존 extraReducers 유지...
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.userStatus.isLoading = true;
        state.userStatus.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.userStatus.isLoading = false;
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

export const {
  updatePlayers,
  updatePlayerScore,
  nextTurn,
  setCurrentWord,
  updateGameState,
  setRoomId,
  updatePlayerNickname,
} = CatchMindSlice.actions;

export default CatchMindSlice.reducer;
