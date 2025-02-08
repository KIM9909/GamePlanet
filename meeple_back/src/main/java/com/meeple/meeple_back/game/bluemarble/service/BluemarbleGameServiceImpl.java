package com.meeple.meeple_back.game.bluemarble.service;

import com.meeple.meeple_back.common.domain.exception.ResourceNotFoundException;
import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleGameService;
import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.BuildBaseResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.BuyLandResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.DrawCardResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.GamePlayResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.PayFeeResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuildBaseRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuyLandRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.CardDrawRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.PayFeeRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.TurnEndRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.TurnEndResponse;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlayCreate;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import com.meeple.meeple_back.game.bluemarble.service.port.BluemarbleGameRepository;
import com.meeple.meeple_back.user.service.UserService;
import java.util.List;
import java.util.logging.Logger;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BluemarbleGameServiceImpl implements BluemarbleGameService {

	private static Logger logger = Logger.getLogger(BluemarbleGameServiceImpl.class.getName());

	private final BluemarbleGameRepository bluemarbleGameRepository;
	private final UserService userService;

	@Override
	@Transactional
	public GamePlayResponse create(GamePlayCreate gamePlayCreate) {
		List<Player> players = gamePlayCreate.getPlayerIds().stream()
				.map(id -> Player.init(userService.findById(id)))
				.toList();
		GamePlay gamePlay = bluemarbleGameRepository.save(GamePlay.from(gamePlayCreate, players));
		logger.info("GamePlay created: " + gamePlay);
		return GamePlayResponse.from(gamePlay);
	}

	@Override
	public DiceRollResponse rollDice(int roomId, DiceRollRequest diceRollRequest) {
		GamePlay gamePlay = bluemarbleGameRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("GamePlay", roomId));
		gamePlay.rollDices(diceRollRequest);
		bluemarbleGameRepository.save(gamePlay);
		return gamePlay.rollDices(diceRollRequest);
	}

	@Override
	public BuyLandResponse buyLand(int roomId, BuyLandRequest buyLandRequest) {
		GamePlay gamePlay = bluemarbleGameRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("GamePlay", roomId));

		return gamePlay.buyLand(buyLandRequest);
	}

	@Override
	public DrawCardResponse drawCard(int roomId, CardDrawRequest cardDrawRequest) {
		GamePlay gamePlay = bluemarbleGameRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("GamePlay", roomId));
		return gamePlay.drawCard(cardDrawRequest);
	}

	@Override
	@Transactional
	public BuildBaseResponse buildBase(int roomId, BuildBaseRequest buildBaseRequest) {
		GamePlay gamePlay = getValidateGamePlay(roomId);
		return gamePlay.buildBase(buildBaseRequest);
	}

	@Override
	@Transactional
	public PayFeeResponse payFee(int roomId, PayFeeRequest payFeeRequest) {
		GamePlay gamePlay = getValidateGamePlay(roomId);
		return gamePlay.payFee(payFeeRequest);
	}

	@Override
	@Transactional
	public TurnEndResponse turnEnd(int roomId, TurnEndRequest turnEndRequest) {
		return null;
	}


	private GamePlay getValidateGamePlay(int roomId) {
		return bluemarbleGameRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("GamePlay", roomId));
	}
}
