package com.meeple.meeple_back.game.bluemarble.domain;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameState {

	private int currentPlayerIndex;
	private List<Player> players;
	private String gameStatus;

	public static GameState init(@NotNull List<Player> players) {
		return GameState.builder()
				.currentPlayerIndex(0)
				.players(players)
				.gameStatus(GameStatus.IN_PROGRESS.getStatus())
				.build();
	}

}
