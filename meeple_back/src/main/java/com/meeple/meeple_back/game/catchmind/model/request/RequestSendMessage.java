package com.meeple.meeple_back.game.catchmind.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    // 추가: isNotice 필드
    @Schema(description = "알림 메시지 여부", example = "false")
    @JsonProperty("isNotice")
    boolean isNotice = false;

    // 추가: score 필드
    @Schema(description = "점수", example = "0")
    int score = 0;
}
