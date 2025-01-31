package com.meeple.meeple_back.game.cockroach.model.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseGuessCard {
    private String nextTurn;        // 다음 턴 플레이어
    private boolean isCorrect;      // 맞췄는지 여부
    private String losingPlayer;    // 패배한 플레이어 (있는 경우)
    private boolean isGameOver;     // 게임 종료 여부
} 