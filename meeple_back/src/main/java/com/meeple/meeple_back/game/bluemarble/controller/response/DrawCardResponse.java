package com.meeple.meeple_back.game.bluemarble.controller.response;

import com.meeple.meeple_back.game.bluemarble.domain.ActionType;
import com.meeple.meeple_back.game.bluemarble.domain.Card;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DrawCardResponse {

	private int playerId;
	private Card pickedCard;
	private Player player;
	private List<Card> cards;
	private int prevPosition;
	private int nextPosition;
	private int prevBalance;
	private int nextBalance;
	private String nextAction;

	public static DrawCardResponse from(int playerId, Card pickedCard, Player player, List<Card> updatedCards, int prevPosition, int nextPosition, int prevBalance, int nextBalance, ActionType nextAction) {
		return DrawCardResponse.builder()
				.playerId(playerId)
				.pickedCard(pickedCard)
				.player(player)
				.cards(updatedCards)
				.prevPosition(prevPosition)
				.nextPosition(nextPosition)
				.prevBalance(prevBalance)
				.nextBalance(nextBalance)
				.nextAction(nextAction.getAction())
				.build();
	}
}
