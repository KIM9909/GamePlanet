package com.meeple.meeple_back.game.bluemarble.domain;

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
public class GamePlay {

	@Id
	private String gamePlayId;

	private int roomId;

	private GameState gameState;

	public GamePlay(int roomId, GameState gameState) {
		this.gamePlayId = java.util.UUID.randomUUID().toString();
		this.roomId = roomId;
		this.gameState = gameState;
	}
}