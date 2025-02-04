package com.meeple.meeple_back.game.bluemarble.controller.port;


import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlayCreate;

public interface BluemarbleGameService {

	GamePlay create(GamePlayCreate gamePlayCreate);

	DiceRollResponse rollDice(int roomId, DiceRollRequest diceRollRequest);
}
