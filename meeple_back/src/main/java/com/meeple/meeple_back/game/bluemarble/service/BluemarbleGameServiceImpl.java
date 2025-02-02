package com.meeple.meeple_back.game.bluemarble.service;

import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleGameService;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlayCreate;
import com.meeple.meeple_back.game.bluemarble.service.port.BluemarbleGameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BluemarbleGameServiceImpl implements BluemarbleGameService {

	private final BluemarbleGameRepository bluemarbleGameRepository;


	@Override
	@Transactional
	public GamePlay create(GamePlayCreate gamePlayCreate) {
		return bluemarbleGameRepository.save(GamePlay.from(gamePlayCreate));
	}
}
