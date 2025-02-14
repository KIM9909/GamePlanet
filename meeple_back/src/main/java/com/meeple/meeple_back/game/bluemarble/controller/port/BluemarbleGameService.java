package com.meeple.meeple_back.game.bluemarble.controller.port;


import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.*;
import com.meeple.meeple_back.game.bluemarble.controller.socket.ChoosePositionRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.*;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.ChoosePositionResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.PayFeeResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.TurnEndResponse;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlayCreate;

public interface BluemarbleGameService {

	GamePlayResponse create(GamePlayCreate gamePlayCreate);

	DiceRollResponse rollDice(int roomId, DiceRollRequest diceRollRequest);

	BuyLandResponse buyLand(int roomId, BuyLandRequest buyLandRequest);

	DrawCardResponse drawCard(int roomId, CardDrawRequest cardDrawRequest);

	BuildBaseResponse buildBase(int roomId, BuildBaseRequest buildBaseRequest);

	PayFeeResponse payFee(int roomId, PayFeeRequest payFeeRequest);

	TurnEndResponse turnEnd(int roomId, TurnEndRequest turnEndRequest);

	GamePlayResponse startTurn(int roomId);

	ChoosePositionResponse choosePosition(int roomId, ChoosePositionRequest request);

	String gameEnd(int roomId);
}
