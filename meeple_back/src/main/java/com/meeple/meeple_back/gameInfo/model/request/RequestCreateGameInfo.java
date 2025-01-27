package com.meeple.meeple_back.gameInfo.model.request;

import com.meeple.meeple_back.game.game.model.Game;
import lombok.Data;

@Data
public class RequestCreateGameInfo {
    private String gameInfoContent;

    private String gameRule;

    private int gameId;

}
