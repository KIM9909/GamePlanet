package com.meeple.meeple_back.game.catchmind.model.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ResponseSendMessage {
    private String roomId;
    private String sender;
    private String content;
    private LocalDateTime timestamp;
    private int score;
    private boolean isCorrect;
}
