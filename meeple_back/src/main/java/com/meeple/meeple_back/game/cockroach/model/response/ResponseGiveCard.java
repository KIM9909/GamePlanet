package com.meeple.meeple_back.game.cockroach.model.response;

import com.meeple.meeple_back.game.cockroach.model.entity.Card;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseGiveCard {
    private String to;      // 받는사람
    private String from;    // 주는사람
    private Card card;      // 전해지는 카드
    private String animal;  // 말한 동물
    private boolean isKing; // 왕 여부(~~왕이야)
    private boolean isNagative; // 반대 여부(~~ 아니야)
}
