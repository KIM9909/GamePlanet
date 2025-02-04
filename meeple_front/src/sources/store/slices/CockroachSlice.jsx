// CockroachSlice.jsx
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roomData: null,
  gameData: null,
  isGameStarted: false,
  currentUser: null,
  players: [],
  playerCards: {},
  publicDeck: [],
  userTableCards: {},
  gameState: {
    currentTurn: null,
    currentCard: null,
    cardSender: null,
    cardReceiver: null,
    claimedAnimal: null,
    isKing: false,
    passedPlayers: [],
    passCount: 0
  }
};

const loadStateFromStorage = () => {
  try {
    const serializedState = localStorage.getItem('cockroachState');
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state:', err);
    return initialState;
  }
};

const saveStateToStorage = (state) => {
  try {
    localStorage.setItem('cockroachState', JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

const cockroachSlice = createSlice({
  name: 'cockroach',
  initialState: loadStateFromStorage(),
  reducers: {
    setRoomData: (state, action) => {
      state.roomData = action.payload;
      saveStateToStorage(state);
    },
    setGameData: (state, action) => {
      console.log("setGameData action received:", action.payload);
      const { players, gameData } = action.payload;
      
      state.players = players;
      if (gameData) {
        state.gameData = gameData;
        state.playerCards = gameData.playerCards || {};
        state.publicDeck = gameData.publicDeck || [];
        state.userTableCards = gameData.userTableCards || {};
        state.gameState = {
          ...state.gameState,
          ...gameData.gameState,
        };
        // isGameStart가 true이면 isGameStarted도 true로 설정
        if (gameData.isGameStart) {
          state.isGameStarted = true;
        }
      }
      saveStateToStorage(state);
    },
    setGameStarted: (state, action) => {
        console.log("이전 게임 상태:", state.isGameStarted);
        console.log("새로운 게임 상태로 설정:", action.payload);
        state.isGameStarted = action.payload;
        saveStateToStorage(state);
      },
    updateGameState: (state, action) => {
      state.gameState = { ...state.gameState, ...action.payload };
      saveStateToStorage(state);
    },
    updatePlayerCards: (state, action) => {
      const { player, cards } = action.payload;
      state.playerCards[player] = cards;
      saveStateToStorage(state);
    },
    updateTableCards: (state, action) => {
      const { player, cards } = action.payload;
      state.userTableCards[player] = cards;
      saveStateToStorage(state);
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      saveStateToStorage(state);
    },
    updatePublicDeck: (state, action) => {
      state.publicDeck = action.payload;
      saveStateToStorage(state);
    },
    resetGame: (state) => {
      // isGameStarted만 초기화하고 다른 데이터는 유지
      state.isGameStarted = false;
      state.gameState = initialState.gameState;
      saveStateToStorage(state);
    }
  }
});

export const {
  setRoomData,
  setGameData,
  setGameStarted,
  updateGameState,
  updatePlayerCards,
  updateTableCards,
  setCurrentUser,
  updatePublicDeck,
  resetGame
} = cockroachSlice.actions;

export default cockroachSlice.reducer;