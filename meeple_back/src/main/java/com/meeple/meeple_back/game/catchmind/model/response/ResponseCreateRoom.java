package com.meeple.meeple_back.game.catchmind.model.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseCreateRoom {
    @Schema(description = "게임방 Pk", example = "1", required = true)
    private int roomId;
}
