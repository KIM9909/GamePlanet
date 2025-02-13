package com.meeple.meeple_back.game.bluemarble.controller.socket.response;

import lombok.Data;

@Data
public class ChoosePositionResponse {
	private final int playerId;
	private final int prevPosition;

	private final int nextPosition;
	private final String nextAction;


}
