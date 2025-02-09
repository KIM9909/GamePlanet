package com.meeple.meeple_back.game.bluemarble.controller.response;

import com.meeple.meeple_back.game.bluemarble.domain.*;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

@Builder
@Getter
@ToString
public class GamePlayResponse {


	private int gamePlayId;
	private int currentPlayerIndex;
	private List<Player> players;
	private String gameStatus;
	private int round;
	private int turnCount;
	private List<Tile> board;
	private List<Card> cards;
	private String nextAction;
	private boolean doubleState;


	public static GamePlayResponse from(GamePlay gamePlay, ActionType actionType) {
		return GamePlayResponse.builder()
				.gamePlayId(gamePlay.getGamePlayId())
				// TODO : 현재 플레이하는 플레이어의 인덱스를 가져오는 로직이 필요함
				.currentPlayerIndex(gamePlay.getTurnManager().getTurnCount())
				.players(gamePlay.getPlayers())
				.gameStatus(gamePlay.getGameStatus())
				.round(gamePlay.getRound())
				.board(gamePlay.getBoard())
				.cards(gamePlay.getCards())
				.nextAction(actionType.name())
				.doubleState(gamePlay.getTurnManager().checkDoubleState())
				.turnCount(gamePlay.getTurnManager().getTurnCount())
				.build();
	}
}
