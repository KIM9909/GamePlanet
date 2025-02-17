package com.meeple.meeple_back.game.bluemarble.controller.response;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Builder
@Getter
@Data
public class SocketRoomResponse {

	private String type;
	private RoomResponse roomResponse;
	private String message;
	private List<CustomElementResponse> customElementResponses;

	public static SocketRoomResponse of(RoomResponse roomResponse, String message) {
		return SocketRoomResponse.builder()
				.type("room")
				.message(message)
				.roomResponse(roomResponse)
				.build();
	}
}
