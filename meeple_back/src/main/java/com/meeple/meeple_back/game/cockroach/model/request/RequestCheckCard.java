package com.meeple.meeple_back.game.cockroach.model.request;

import com.meeple.meeple_back.game.cockroach.model.entity.Card;
import lombok.Data;

@Data
public class RequestCheckCard {
    private String from;    // 준 사람
    private String to;      // 받는 사람
    private Card card;      // 카드
    private boolean isCorrect;  // 정답 여부
}
