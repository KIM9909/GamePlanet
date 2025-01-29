package com.meeple.meeple_back.game.catchmind.model.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseQuiz {
    String quiz;
    String quizCategory;
    int remainQuizCount;
}
