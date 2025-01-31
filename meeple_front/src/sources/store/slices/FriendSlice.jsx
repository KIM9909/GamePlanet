import { createSlice, createAsyncThunk, isAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  fetchFriendList,
  requestFriend,
  processRequest,
  deleteFriend,
} from "../../api/FriendApi";
import { act } from "react";

// 비동기 액션 (친구 목록 가져오기)
export const fetchFriends = createAsyncThunk(
  "friend/fetchFriends",
  async (userId, { rejectWithValue }) => {
    try {
      return await fetchFriendList(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "친구 목록을 가져오지 못했습니다."
      );
    }
  }
);

// 친구 요청 보내기 (WebSocket)
export const sendFriendRequest = createAsyncThunk(
  "friend/sendFriendRequest",
  async ({ userId, requestData }, { rejectWithValue }) => {
    try {
      return await requestFriend(userId, requestData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "친구 요청을 보내지 못했습니다."
      );
    }
  }
);

// 친구 요청 승인 / 거절 (WebSocket)
export const handleFriendRequest = createAsyncThunk(
  "friend/handleFriendRequest",
  async ({ friendId, requestData }, { rejectWithValue }) => {
    try {
      return await processRequest(friendId, requestData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "요청을 처리할 수 없습니다."
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
  status: "idle",
  error: null,
};

// Redux 슬라이스
const friendSlice = createSlice({
  name: "friend",
  initialState,
  reducers: {
    clearFriends: (state) => {
      state.friends = [];
      state.status = "idle";
      state.error = null;
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
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(handleFriendRequest.rejected, (state, action) => {
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
export const { clearFriends } = friendSlice.actions;
export default friendSlice.reducer;
