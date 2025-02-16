package com.meeple.meeple_back.game.bluemarble.controller.response;

import com.meeple.meeple_back.game.bluemarble.domain.ActionType;
import com.meeple.meeple_back.game.bluemarble.domain.Card;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import com.meeple.meeple_back.game.bluemarble.domain.Tile;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@Getter
@ToString
public class GamePlayResponse {


	private int gamePlayId;
	private int currentPlayerIndex;
	private List<Player> players;
	private String gameStatus;
	private int round;
	private List<Tile> board;
	private List<Card> cards;
	private String nextAction;
	private boolean doubleState;


	public static GamePlayResponse from(GamePlay gamePlay, ActionType actionType) {
		return GamePlayResponse.builder()
				.gamePlayId(gamePlay.getGamePlayId())
				.currentPlayerIndex(gamePlay.getTurnManager().getCurrentPlayerIndex())
				.gameStatus(gamePlay.getGameStatus())
				.round(gamePlay.getRound())
				.board(gamePlay.getBoard())
				.cards(gamePlay.getCards())
				.nextAction(actionType.name())
				.doubleState(gamePlay.getTurnManager().checkDoubleState())
				.players(gamePlay.getTurnManager().getPlayers())
				.build();
	}
}
