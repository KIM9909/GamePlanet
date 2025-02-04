package com.meeple.meeple_back.game.bluemarble.controller.request;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoomJoinWithPassword {

	private final int userId;
	private final String password;

	@JsonCreator
	public RoomJoinWithPassword(@JsonProperty("userId") int userId,
			@JsonProperty("password") String password) {
		this.userId = userId;
		this.password = password;
	}
}

