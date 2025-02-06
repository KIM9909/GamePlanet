package com.meeple.meeple_back.game.bluemarble.controller.socket.request;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BuyLandRequest {

	private int playerId;
	private int tileId;
	private String action;

	public BuyLandRequest(int playerId, int tileId, String action) {
		this.playerId = playerId;
		this.tileId = tileId;
		this.action = action;
	}
}

