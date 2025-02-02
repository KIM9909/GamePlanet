package com.meeple.meeple_back.game.bluemarble.infrastructure;


import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.GameState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@RedisHash("GamePlay")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GamePlayEntity {

	@Id
	private int gamePlayId;
	private GameState gameState;


	public static GamePlayEntity from(GamePlay gamePlay) {
		return GamePlayEntity.builder()
				.gamePlayId(gamePlay.getGamePlayId())
				.gameState(gamePlay.getGameState())
				.build();
	}

	public static GamePlay toGamePlay(GamePlayEntity gamePlayEntity) {
		return GamePlay.builder()
				.gamePlayId(gamePlayEntity.getGamePlayId())
				.gameState(gamePlayEntity.getGameState())
				.build();
	}
}
