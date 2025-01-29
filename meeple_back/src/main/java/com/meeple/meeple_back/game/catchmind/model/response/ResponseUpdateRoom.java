package com.meeple.meeple_back.game.catchmind.model.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseUpdateRoom {
    private String roomTitle;
    private boolean isPrivate;
    private String password;
    private int maxPeople;
    private int timeLimit;
    private int quizCount;
}
