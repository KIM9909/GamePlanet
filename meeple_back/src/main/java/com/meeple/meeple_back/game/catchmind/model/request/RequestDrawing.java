package com.meeple.meeple_back.game.catchmind.model.request;

import lombok.Data;

@Data
public class RequestDrawing {
    private String type;
    private int roomId;
    private long userId;
    private int x;
    private int y;
    private String color;
    private String lineWidth;
}
