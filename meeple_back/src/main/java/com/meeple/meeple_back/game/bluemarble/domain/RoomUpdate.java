package com.meeple.meeple_back.game.bluemarble.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;

@Getter
public class RoomUpdate {

	@NotBlank(message = "Room name is mandatory")
	private final String roomName;

	private final boolean isPrivate;

	private final boolean isGameStart;

	@Min(value = 1, message = "플레이어는 최소 1명 이상이 필요합니다.")
	private final int maxPlayers;

	@Builder
	@JsonCreator
	public RoomUpdate(
			@JsonProperty("roomName") String roomName,
			@JsonProperty("isPrivate") boolean isPrivate,
			@JsonProperty("isGameStart") boolean isGameStart,
			@JsonProperty("maxPlayers") int maxPlayers) {
		this.roomName = roomName;
		this.isPrivate = isPrivate;
		this.isGameStart = isGameStart;
		this.maxPlayers = maxPlayers;
	}
}
