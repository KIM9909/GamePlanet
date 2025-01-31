package com.meeple.meeple_back.game.catchmind.model.response;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class ResponseJoinRoom {
    private int code;
    private String message;
    Map<String, Object> roomInfo;
}
