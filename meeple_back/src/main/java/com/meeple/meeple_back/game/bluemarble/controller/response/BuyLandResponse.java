package com.meeple.meeple_back.game.bluemarble.controller.response;

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

}
