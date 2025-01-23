package com.meeple.meeple_back.game.cockroach.model.request;

import com.meeple.meeple_back.game.cockroach.model.entity.Card;
import java.util.List;
import lombok.Data;

@Data
public class RequestMultiCard {
    private String user;
    private List<Card> cards;
    private boolean isBlack;
}
