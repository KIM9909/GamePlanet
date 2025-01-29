package com.meeple.meeple_back.friend.model.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseFriend {
    private int friendId;
    private long senderId;
    private String senderName;
    private String message;
}
