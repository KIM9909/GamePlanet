import { createSlice, createAsyncThunk, isAction } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchFriendList, deleteFriend } from "../../api/FriendApi";
import { act } from "react";

// 비동기 액션 (친구 목록 가져오기)
export const fetchFriends = createAsyncThunk(
  "friend/fetchFriends",
  async (userId, { rejectWithValue }) => {
    console.log(
      "📡 [프론트] API 요청: 친구 목록 가져오기 (userId:",
      userId,
      ")"
    );
    try {
      const response = await fetchFriendList(userId);
      console.log("✅ [프론트] API 응답 데이터:", response);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "친구 목록을 가져오지 못했습니다."
      );
    }
  }
);

// 친구 삭제
export const removeFriend = createAsyncThunk(
  "friend/removeFriend",
  async (friendId, { rejectWithValue }) => {
    try {
      return await deleteFriend(friendId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "친구 삭제를 하지 못했습니다."
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
    removeFriend: (state, action) => {
      state.friends = state.friends.filter(
        (friend) => friend.friendId !== action.payload
      );
    },
    addFriendRequest: (state, action) => {
      state.friendRequests.push(action.payload);
    },
    removeFriendRequest: (state, action) => {
      state.friendRequests = state.friendRequests.filter(
        (request) => request.friendId !== action.payload
      ); // ✅ 친구 요청 삭제
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
        console.log("✅ 친구 목록 업데이트 완료:", action.payload);
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(
          (friend) => friend.id !== action.meta.arg
        );
      });
  },
});

// 액션 & 리듀서 내보내기
export const {
  setFriends,
  addFriendRequest,
  removeFriendRequest,
  clearFriendRequests,
} = friendSlice.actions;
export default friendSlice.reducer;
