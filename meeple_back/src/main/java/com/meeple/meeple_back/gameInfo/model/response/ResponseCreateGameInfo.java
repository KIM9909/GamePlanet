package com.meeple.meeple_back.gameInfo.model.response;

import com.meeple.meeple_back.game.game.model.Game;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseCreateGameInfo {
    private int gameInfoId;
    private Game game;
}
