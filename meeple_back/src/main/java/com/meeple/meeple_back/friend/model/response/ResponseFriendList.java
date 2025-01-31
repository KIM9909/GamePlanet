package com.meeple.meeple_back.friend.model.response;

import com.meeple.meeple_back.friend.model.FriendStatus;
import com.meeple.meeple_back.user.model.User;
import lombok.Data;

@Data
public class ResponseFriendList {
    private int friendId;
    private FriendStatus friendStatus;
    private User friend;
}
