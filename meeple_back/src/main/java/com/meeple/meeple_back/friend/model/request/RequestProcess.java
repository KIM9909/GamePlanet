package com.meeple.meeple_back.friend.model.request;

import lombok.Data;

@Data
public class RequestProcess {
    private long requesterId;
    private long targetId;
    private String requirements;
}
