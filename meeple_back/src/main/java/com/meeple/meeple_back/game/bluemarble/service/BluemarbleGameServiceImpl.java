package com.meeple.meeple_back.game.bluemarble.service;

import com.meeple.meeple_back.common.domain.exception.ResourceNotFoundException;
import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleGameService;
import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlayCreate;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import com.meeple.meeple_back.game.bluemarble.service.port.BluemarbleGameRepository;
import com.meeple.meeple_back.user.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BluemarbleGameServiceImpl implements BluemarbleGameService {

	private final BluemarbleGameRepository bluemarbleGameRepository;
	private final UserService userService;

	@Override
	@Transactional
	public GamePlay create(GamePlayCreate gamePlayCreate) {
		List<Player> players = gamePlayCreate.getPlayerIds().stream()
				.map(id -> Player.init(userService.findById(id)))
				.toList();
		return bluemarbleGameRepository.save(GamePlay.from(gamePlayCreate, players));
	}

	@Override
	public DiceRollResponse rollDice(int roomId, DiceRollRequest diceRollRequest) {
		GamePlay gamePlay = bluemarbleGameRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("GamePlay", roomId));
		gamePlay.rollDices(diceRollRequest);
		bluemarbleGameRepository.save(gamePlay);
		return gamePlay.rollDices(diceRollRequest);
	}
}
