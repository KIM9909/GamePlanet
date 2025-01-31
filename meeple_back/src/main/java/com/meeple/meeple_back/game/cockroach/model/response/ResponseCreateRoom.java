package com.meeple.meeple_back.game.cockroach.model.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseCreateRoom {
    @Schema(description = "게임방 PK", example = "n1")
    private int roomId;
}
