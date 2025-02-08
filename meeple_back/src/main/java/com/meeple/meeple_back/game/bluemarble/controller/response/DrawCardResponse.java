package com.meeple.meeple_back.game.bluemarble.controller.response;

import com.meeple.meeple_back.game.bluemarble.domain.ActionType;
import com.meeple.meeple_back.game.bluemarble.domain.Card;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DrawCardResponse {

	private int playerId;
	private Card card;
	private Player player;
	private String nextAction;
	
	public static DrawCardResponse from(int playerId, Player player, Card card,
			ActionType nextAction) {
		return DrawCardResponse.builder()
				.playerId(playerId)
				.card(card)
				.player(player)
				.nextAction(nextAction.name())
				.build();
	}
}
