import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/UserSlice'
import boardReducer from './slices/BoardSlice'
import gameReducer from './slices/GameSlice'
import tournamentReducer from './slices/TournamentSlice'

export const Store = configureStore({
  reducer: {
    user: userReducer,
    board: boardReducer,
    game: gameReducer,
    tournament: tournamentReducer
  }
})