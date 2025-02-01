package com.meeple.meeple_back.game.bluemarble.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoomCreate {

	private int gameId;

	@NotBlank(message = "Room name is mandatory")
	private String roomName;

	private boolean isPrivate;

	private String password;

	private boolean isGameStart;

	private int creator;

	private int maxPlayers;

	@JsonCreator
	public RoomCreate(@JsonProperty("gameId") int gameId, @JsonProperty("roomName") String roomName,
			@JsonProperty("isPrivate") boolean isPrivate, @JsonProperty("password") String password,
			@JsonProperty("isGameStart") boolean isGameStart, @JsonProperty("creator") int creator,
			@JsonProperty("maxPlayers") int maxPlayers) {
		this.gameId = gameId;
		this.roomName = roomName;
		this.isPrivate = isPrivate;
		this.password = password;
		this.isGameStart = isGameStart;
		this.creator = creator;
		this.maxPlayers = maxPlayers;
	}
}
