package com.meeple.meeple_back.game.bluemarble.controller.socket;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ChoosePositionRequest {
	@JsonProperty("nextPosition")
	private int nextPosition;
	@JsonProperty("playerId")
	private int playerId;

	@JsonCreator
	public ChoosePositionRequest(@JsonProperty("nextPosition") int nextPosition, @JsonProperty("playerId") int playerId) {
		this.nextPosition = nextPosition;
		this.playerId = playerId;
	}
}
