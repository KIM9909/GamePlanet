package com.meeple.meeple_back.game.bluemarble.controller.response;

import com.meeple.meeple_back.game.bluemarble.domain.ActionType;
import com.meeple.meeple_back.game.bluemarble.domain.Tile;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BuyLandResponse {

	private int playerId;
	private String action;
	private int prevMoney;
	private int updatedMoney;

	private Tile updatedTile;
	private String nextAction;

	public static BuyLandResponse of(int playerId, String action, int prevMoney, int updatedMoney,
			Tile updatedTile, ActionType nextAction) {
		return BuyLandResponse.builder()
				.playerId(playerId)
				.action(action)
				.prevMoney(prevMoney)
				.updatedMoney(updatedMoney)
				.updatedTile(updatedTile)
				.nextAction(nextAction.name())
				.build();
	}

}
