package com.meeple.meeple_back.game.catchmind.model.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseVoteResult {
    private String target;
    private boolean isLeave;
}
