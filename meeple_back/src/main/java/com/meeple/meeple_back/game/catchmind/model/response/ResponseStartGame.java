package com.meeple.meeple_back.game.catchmind.model.response;

import com.meeple.meeple_back.game.catchmind.model.entity.Quiz;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class ResponseStartGame {
    private List<String> sequence;
    private List<Quiz> quizList;
}
