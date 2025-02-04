package com.meeple.meeple_back.game.bluemarble.domain;

import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GamePlay {

	private final int gamePlayId;
	private int currentPlayerIndex;
	private List<Player> players;
	private String gameStatus;
	private int round;
	private List<Tile> board;
	private List<Card> cards;

	@Builder
	public static GamePlay from(GamePlayCreate gamePlayCreate, List<Player> players) {
		return GamePlay.builder()
				.gamePlayId(gamePlayCreate.getGamePlayId())
				.currentPlayerIndex(0)
				.players(players)
				.gameStatus(GameStatus.IN_PROGRESS.getStatus())
				.round(1)
				.board(createTiles())
				.build();
	}

	private static List<Tile> createTiles() {
		return new ArrayList<>();
	}

	public Player getCurrentPlayer() {
		return this.getPlayers().stream()
				.filter(player -> player.getPlayerId() == currentPlayerIndex)
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Player not found"));
	}

	public DiceRollResponse rollDices(DiceRollRequest diceRollRequest) {
		return getCurrentPlayer().rollDices(diceRollRequest);
	}
}