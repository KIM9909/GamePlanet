package com.meeple.meeple_back.game.cockroach.model.request;

import lombok.Data;

@Data
public class RequestGuessCard {
    private String from;        // 판단하는 플레이어
    private String action;      // "GUESS" 또는 "PASS"
    private Boolean isTrue;     // action이 "GUESS"일 때만 사용, true면 "진실", false면 "거짓"
} 