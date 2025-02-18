import { createSlice, createAsyncThunk, isAction } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchFriendList, deleteFriend } from "../../api/FriendApi";

// 비동기 액션 (친구 목록 가져오기)
export const fetchFriends = createAsyncThunk(
  "friend/fetchFriends",
  async (userId, { rejectWithValue }) => {

    try {
      const response = await fetchFriendList(userId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "친구 목록을 가져오지 못했습니다."
      );
    }
  }
);

const initialState = {
  friends: [],
  friendRequests: [],
  status: "idle",
  error: null,
};

// Redux 슬라이스
const friendSlice = createSlice({
  name: "friend",
  initialState,
  reducers: {
    setFriends: (state, action) => {
      state.friends = action.payload;
    },
    addFriend: (state, action) => {
      state.friends.push(action.payload);
    },
    clearFriendRequests: (state) => {
      state.friendRequests = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// 액션 & 리듀서 내보내기
export const { setFriends, addFriendRequest, clearFriendRequests } =
  friendSlice.actions;
export default friendSlice.reducer;
