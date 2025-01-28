package com.meeple.meeple_back.friend.service;

import com.meeple.meeple_back.friend.model.request.RequestFriend;
import com.meeple.meeple_back.friend.model.request.RequestProcess;
import com.meeple.meeple_back.friend.model.response.ResponseFriendList;

import java.util.List;

public interface FriendService {
    List<ResponseFriendList> findFriendList(long userId);

    void requestFriend(long userId, RequestFriend request);

    void processRequest(int friendId, RequestProcess request);

    void deleteFriend(int friendId);
}
