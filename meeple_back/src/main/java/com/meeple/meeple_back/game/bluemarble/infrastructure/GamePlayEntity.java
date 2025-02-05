package com.meeple.meeple_back.game.bluemarble.infrastructure;


import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import com.meeple.meeple_back.game.bluemarble.domain.Tile;
import java.util.List;
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

	private int currentPlayerIndex;
	private List<Player> players;
	private String gameStatus;
	private int round;
	private List<Tile> board;


	public static GamePlayEntity from(GamePlay gamePlay) {
		return GamePlayEntity.builder()
				.gamePlayId(gamePlay.getGamePlayId())
				.currentPlayerIndex(gamePlay.getCurrentPlayerIndex())
				.players(gamePlay.getPlayers())
				.gameStatus(gamePlay.getGameStatus())
				.round(gamePlay.getRound())
				.board(gamePlay.getBoard())
				.build();
	}

	public static GamePlay toGamePlay(GamePlayEntity gamePlayEntity) {
		return GamePlay.builder()
				.gamePlayId(gamePlayEntity.getGamePlayId())
				.currentPlayerIndex(gamePlayEntity.getCurrentPlayerIndex())
				.players(gamePlayEntity.getPlayers())
				.gameStatus(gamePlayEntity.getGameStatus())
				.round(gamePlayEntity.getRound())
				.board(gamePlayEntity.getBoard())
				.build();
	}
}
