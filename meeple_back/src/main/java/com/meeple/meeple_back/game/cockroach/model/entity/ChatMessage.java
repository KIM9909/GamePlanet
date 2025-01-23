package com.meeple.meeple_back.game.cockroach.model.entity;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatMessage {
    private String roomId;
    private String sender;
    private String content;
    private LocalDateTime timestamp;

}
