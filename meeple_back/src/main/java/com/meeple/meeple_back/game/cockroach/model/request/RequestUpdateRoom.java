package com.meeple.meeple_back.game.cockroach.model.request;

import lombok.Data;

@Data
public class RequestUpdateRoom {
    private String roomTitle;
    private boolean isPrivate;
    private String password;
    private int maxPeople;
}
