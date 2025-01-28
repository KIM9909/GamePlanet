package com.meeple.meeple_back.game.catchmind.model.request;

import lombok.Data;

@Data
public class RequestSendMessage {
    String message;
    String sender;
    String correctAnswer;
}
