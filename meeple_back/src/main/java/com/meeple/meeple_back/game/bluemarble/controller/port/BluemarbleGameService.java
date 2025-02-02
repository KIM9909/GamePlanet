package com.meeple.meeple_back.game.bluemarble.controller.port;


import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlayCreate;

public interface BluemarbleGameService {

	GamePlay create(GamePlayCreate gamePlayCreate);
}
