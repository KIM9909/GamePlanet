package com.meeple.meeple_back.game.bluemarble.domain;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;

@Getter
public class RoomUpdate {

	private final int gameId;

	@NotBlank(message = "Room name is mandatory")
	private final String roomName;

	private final boolean isPrivate;

	private final boolean isGameStart;

	@NotBlank(message = "방장은 필수입니다.")
	private final int creator;

	@Min(value = 1, message = "플레이어는 최소 1명 이상이 필요합니다.")
	private final int maxPlayers;

	@Builder
	public RoomUpdate(int gameId, String roomName, boolean isPrivate, boolean isGameStart,
			int creator,
			int maxPlayers) {
		this.gameId = gameId;
		this.roomName = roomName;
		this.isPrivate = isPrivate;
		this.isGameStart = isGameStart;
		this.creator = creator;
		this.maxPlayers = maxPlayers;
	}
}
