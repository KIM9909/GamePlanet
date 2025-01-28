package com.meeple.meeple_back.game.catchmind.model.request;

import lombok.Data;

@Data
public class RequestJoinRoom {
    private int roomId;
    private String playerName;
}
