package com.meeple.meeple_back.gameInfo.model.response;

import com.meeple.meeple_back.game.game.model.Game;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseGameInfo {
    @Schema(description = "게임 정보 설명", example = "이 게임은...")
    private String gameInfoContent;

    @Schema(description = "게임 규칙", example = "이 게임의 규칙은...")
    private String gameRule;

    @Schema(description = "게임", example = "{gameId: 1, ...}")
    Game game;
}
