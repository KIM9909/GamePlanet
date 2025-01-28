package com.meeple.meeple_back.game.catchmind.model.request;

import lombok.Data;

@Data
public class RequestVoteResult {
    private String target;
    private boolean result;
}
