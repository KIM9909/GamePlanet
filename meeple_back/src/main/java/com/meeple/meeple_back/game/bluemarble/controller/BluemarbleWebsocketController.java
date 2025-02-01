package com.meeple.meeple_back.game.bluemarble.controller;

import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleRoomService;
import com.meeple.meeple_back.game.bluemarble.domain.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/blue-marble")
@RequiredArgsConstructor
public class BluemarbleWebsocketController {

	private final BluemarbleRoomService roomService;


	/**
	 * 클라이언트로부터 메시지를 수신하고, 해당 방의 구독자들에게 메시지를 브로드캐스트
	 */
	@MessageMapping("/sendMessage")
	@SendTo("/topic/messages/{roomId}")
	public Message sendMessage(@Payload Message message) {
		return message;
	}


}
