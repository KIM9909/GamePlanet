package com.meeple.meeple_back.game.bluemarble.domain;

import jakarta.validation.constraints.Min;
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

	@NotBlank(message = "방장은 필수입니다.")
	private int creator;

	@Min(value = 1, message = "플레이어는 최소 1명 이상이 필요합니다.")
	private int maxPlayers;


}
