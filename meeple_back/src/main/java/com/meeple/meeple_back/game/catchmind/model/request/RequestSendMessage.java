package com.meeple.meeple_back.game.catchmind.model.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class RequestSendMessage {
    @Schema(description = "메세지", example = "메세지", required = true)
    String message;
    @Schema(description = "발송자", example = "nick1", required = true)
    String sender;
    @Schema(description = "정답", example = "사과", required = true)
    String correctAnswer;
}
