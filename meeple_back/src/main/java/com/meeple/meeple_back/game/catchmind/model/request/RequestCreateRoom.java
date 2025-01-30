package com.meeple.meeple_back.game.catchmind.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class RequestCreateRoom {
    private int gameId;
    private String roomTitle;
    private String creator;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
    private String password;
    private int maxPeople;
    private int timeLimit;
    private int quizCount;
}
