package com.meeple.meeple_back.game.bluemarble.controller.port;


import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.BuildBaseResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.BuyLandResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.DrawCardResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.PayFeeResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuildBaseRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuyLandRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.CardDrawRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.PayFeeRequest;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlayCreate;

public interface BluemarbleGameService {

	GamePlay create(GamePlayCreate gamePlayCreate);

	DiceRollResponse rollDice(int roomId, DiceRollRequest diceRollRequest);

	BuyLandResponse buyLand(int roomId, BuyLandRequest buyLandRequest);

	DrawCardResponse drawCard(int roomId, CardDrawRequest cardDrawRequest);

	BuildBaseResponse buildBase(int roomId, BuildBaseRequest buildBaseRequest);

	PayFeeResponse payFee(int roomId, PayFeeRequest payFeeRequest);
}
