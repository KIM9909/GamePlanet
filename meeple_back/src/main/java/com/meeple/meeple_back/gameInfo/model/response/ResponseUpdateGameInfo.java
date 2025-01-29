package com.meeple.meeple_back.gameInfo.model.response;

import lombok.Builder;
import lombok.Data;

@Data
public class ResponseUpdateGameInfo {
    int code;
    String message;

    public ResponseUpdateGameInfo(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
