package com.meeple.meeple_back.game.bluemarble.infrastructure;


import com.meeple.meeple_back.game.bluemarble.domain.Card;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import com.meeple.meeple_back.game.bluemarble.domain.Tile;
import com.meeple.meeple_back.game.bluemarble.domain.TurnManager;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@RedisHash("GamePlayEntity")
@Getter
@Builder
public class GamePlayEntity {

	@Id
	private int gamePlayId;
	private int currentPlayerIndex;
	private List<Player> players;
	private String gameStatus;
	private int round;
	private List<Tile> board;
	private List<Card> cards;
	private TurnManager turnManager;


	public GamePlayEntity() {

	}

	public GamePlayEntity(int gamePlayId, int currentPlayerIndex, List<Player> players,
			String gameStatus, int round, List<Tile> board, List<Card> cards,
			TurnManager turnManager
	) {
		this.gamePlayId = gamePlayId;
		this.currentPlayerIndex = currentPlayerIndex;
		this.players = players;
		this.gameStatus = gameStatus;
		this.round = round;
		this.board = board;
		this.cards = cards;
		this.turnManager = turnManager;
	}

	public static GamePlayEntity from(GamePlay gamePlay) {
		return new GamePlayEntity(
				gamePlay.getGamePlayId(),
				gamePlay.getCurrentPlayerIndex(),
				gamePlay.getPlayers(),
				gamePlay.getGameStatus(),
				gamePlay.getRound(),
				gamePlay.getBoard(),
				gamePlay.getCards(),
				gamePlay.getTurnManager()
		);
	}

	public static GamePlay toGamePlay(GamePlayEntity gamePlayEntity) {
		return GamePlay.builder()
				.gamePlayId(gamePlayEntity.getGamePlayId())
				.currentPlayerIndex(gamePlayEntity.getCurrentPlayerIndex())
				.players(gamePlayEntity.getPlayers())
				.gameStatus(gamePlayEntity.getGameStatus())
				.round(gamePlayEntity.getRound())
				.board(gamePlayEntity.getBoard())
				.cards(gamePlayEntity.getCards())
				.turnManager(gamePlayEntity.getTurnManager())
				.build();
	}
}
