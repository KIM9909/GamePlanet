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
  currentTurnIndex: 0,
  userStatus: {
    isLoading: false,
    error: null,
  },
};

const CatchMindSlice = createSlice({
  name: "catchmind",
  initialState,
  reducers: {
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
        state.players = players.map((player) => ({
          id: player.id || Math.random().toString(36).substr(2, 9),
          nickname: player.nickname,
          score: player.score || 0,
          isTurn: player.isTurn || false,
          isCurrentUser: player.isCurrentUser || false,
        }));
      }
    },

    updatePlayerScore: (state, action) => {
      const { nickname, score } = action.payload;
      const player = state.players.find((p) => p.nickname === nickname);
      if (player) {
        player.score = (player.score || 0) + score;
      }
    },

    nextTurn: (state) => {
      const currentIndex = state.players.findIndex((p) => p.isTurn);
      const nextIndex = (currentIndex + 1) % state.players.length;

      state.players.forEach((player, index) => {
        player.isTurn = index === nextIndex;
      });

      state.currentTurnIndex = nextIndex;
    },

    setCurrentWord: (state, action) => {
      state.currentWord = action.payload;
    },

    updateGameState: (state, action) => {
      const { currentWord, currentRound, currentTurn } = action.payload;

      // 상태 업데이트
      state.currentWord = currentWord || state.currentWord;
      state.currentRound = currentRound || state.currentRound;

      // 턴 업데이트
      if (currentTurn) {
        state.players.forEach((player) => {
          player.isTurn = player.nickname === currentTurn;
        });
      }
    },

    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
  },
  extraReducers: (builder) => {
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
