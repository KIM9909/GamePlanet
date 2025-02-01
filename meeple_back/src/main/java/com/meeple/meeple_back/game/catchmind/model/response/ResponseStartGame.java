package com.meeple.meeple_back.game.catchmind.model.response;

import com.meeple.meeple_back.game.catchmind.model.entity.Quiz;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class ResponseStartGame {
    @Schema(description = "게임 순서", example = "[nick1, nick2]")
    private List<String> sequence;
    @Schema(description = "퀴즈 목록", example = "[{quiz: 사과}, {quiz: 바나나}, ...]")
    private List<Quiz> quizList;
}
