package com.meeple.meeple_back.game.cockroach.model.request;

import lombok.Data;

@Data
public class RequestSendMessage {
    String roomId;
    String message;
    String sender;
}
