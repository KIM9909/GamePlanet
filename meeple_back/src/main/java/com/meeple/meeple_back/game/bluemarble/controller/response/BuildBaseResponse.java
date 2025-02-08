package com.meeple.meeple_back.game.bluemarble.controller.response;

import com.meeple.meeple_back.game.bluemarble.domain.ActionType;
import com.meeple.meeple_back.game.bluemarble.domain.Tile;
import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class BuildBaseResponse {

	private int playerId;
	private String action;
	private int prevMoney;
	private int updatedMoney;
	private Tile updatedTile;

	public static BuildBaseResponse from(int playerId, ActionType actionType, int prevMoney,
			int updatedMoney, Tile updatedTile) {
		return BuildBaseResponse.builder()
				.playerId(playerId)
				.action(actionType.name())
				.prevMoney(prevMoney)
				.updatedMoney(updatedMoney)
				.updatedTile(updatedTile)
				.build();
	}
}
