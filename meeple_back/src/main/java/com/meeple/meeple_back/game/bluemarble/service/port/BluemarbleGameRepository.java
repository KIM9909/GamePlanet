package com.meeple.meeple_back.game.bluemarble.service.port;

import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;

public interface BluemarbleGameRepository {

	GamePlay save(GamePlay gamePlay);
}
