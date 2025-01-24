package com.meeple.meeple_back.game.cockroach.model.response;

import com.meeple.meeple_back.game.cockroach.model.entity.Card;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseCheckCard {
    private String userName;    // 먹을 플레이어
    private List<Card> cards;          // 먹을 카드
    private boolean isEnd;      // 게임 종료 여부
    private String loser;
}
