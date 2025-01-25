package com.meeple.meeple_back.game.cockroach.model.request;

import lombok.Data;

@Data
public class RequestVote {
    private String voter;
    private boolean isApproval;
}
