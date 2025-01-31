package com.meeple.meeple_back.game.cockroach.model.request;

import lombok.Data;

@Data
public class RequestCreateRoom {
    private int gameId;
    private String roomTitle;
    private String creator; // 방 제작자
    private boolean isPrivate;
    private String password;
    private int maxPeople;
}
