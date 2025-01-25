package com.meeple.meeple_back.game.cockroach.model.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseCreateRoom {
    private int roomId;
}
