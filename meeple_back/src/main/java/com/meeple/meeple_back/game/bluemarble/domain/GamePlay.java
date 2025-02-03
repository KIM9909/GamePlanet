package com.meeple.meeple_back.game.bluemarble.domain;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GamePlay {

	private final int gamePlayId;

	private final GameState gameState;

	public GamePlay(int roomId, GameState gameState) {
		this.gamePlayId = roomId;
		this.gameState = gameState;
	}

	@Builder
	public static GamePlay from(GamePlayCreate gamePlayCreate, List<Player> players) {
		return GamePlay.builder()
				.gamePlayId(gamePlayCreate.getGamePlayId())
				.gameState(GameState.init(players))
				.build();
	}
}