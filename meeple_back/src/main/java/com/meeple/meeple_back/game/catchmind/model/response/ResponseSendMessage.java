package com.meeple.meeple_back.game.catchmind.model.response;

import com.meeple.meeple_back.game.catchmind.model.MessageType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ResponseSendMessage {
    @Schema(description = "메세지 타입", example = "SYSTEM")
    private MessageType messageType;

    @Schema(description = "상태 코드", example = "200")
    private int code;

    @Schema(description = "반환 메세지 ", example = "성공적으로 반환되었습니다.")
    private String responseMessage;

    @Schema(description = "메세지 발송자", example = "nick1")
    private String sender;

    @Schema(description = "메세지 내용", example = "내용")
    private String content;

    @Schema(description = "다음 출제자", example = "nick1")
    private String nextTurn;

    @Schema(description = "다음 정답", example = "사과")
    private String nextAnswer;

    @Schema(description = "남은 퀴즈 갯수", example = "9")
    private int remainQuizCount;

    @Schema(description = "메세지 발송 시간", example = "20240120T12:12")
    private LocalDateTime timestamp;

    @Schema(description = "점수", example = "10")
    private int score;

    @Schema(description = "정답 여부", example = "true")
    private boolean isCorrect;
}
