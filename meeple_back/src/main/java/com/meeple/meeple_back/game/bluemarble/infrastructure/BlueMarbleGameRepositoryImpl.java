package com.meeple.meeple_back.game.bluemarble.infrastructure;

import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.service.port.BluemarbleGameRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class BlueMarbleGameRepositoryImpl implements BluemarbleGameRepository {

	private final BluemarbleGameRedisRepository bluemarbleGameRedisRepository;

	@Override
	public GamePlay save(GamePlay gamePlay) {
		return GamePlayEntity.toGamePlay(
				bluemarbleGameRedisRepository.save(GamePlayEntity.from(gamePlay)));
	}

	@Override
	public Optional<GamePlay> findById(int roomId) {
		return Optional.ofNullable(GamePlayEntity.toGamePlay(
				bluemarbleGameRedisRepository.findById(roomId).orElseThrow()));
	}
}
