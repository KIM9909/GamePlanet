package com.meeple.meeple_back.game.bluemarble.controller;

import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleGameService;
import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@Tag(name = "게임플레이(블루마블)")
@Builder
@RequiredArgsConstructor
@RequestMapping("/game/blue-marble/game-plays")
public class BluemarbleGameController {

	private final SimpMessageSendingOperations messagingTemplate;
	private final BluemarbleGameService bluemarbleGameService;

	@MessageMapping("/{roomId}/roll-dice")
	@Operation(summary = "주사위 굴리기", description = "주사위를 굴립니다.")
	public void rollDice(@DestinationVariable("roomId") int roomId,
			@Payload DiceRollRequest diceRollRequest) {
		DiceRollResponse diceRollResponse = bluemarbleGameService.rollDice(roomId, diceRollRequest);
		messagingTemplate.convertAndSend("/topic/game-plays/" + roomId, diceRollResponse);
	}
}
