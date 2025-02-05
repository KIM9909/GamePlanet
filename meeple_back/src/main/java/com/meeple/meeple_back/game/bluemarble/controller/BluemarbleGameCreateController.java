package com.meeple.meeple_back.game.bluemarble.controller;

import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleGameService;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlay;
import com.meeple.meeple_back.game.bluemarble.domain.GamePlayCreate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@Tag(name = "게임플레이(블루마블) 생성")
@Builder
@RequiredArgsConstructor
@RequestMapping("/game/blue-marble/game-plays")
public class BluemarbleGameCreateController {

	private final BluemarbleGameService bluemarbleGameService;
	private final SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/create")
	@Operation(summary = "게임환경 생성", description = "게임환경을 생성합니다.")
	public void create(@RequestBody GamePlayCreate gamePlayCreate) {
		GamePlay gamePlay = bluemarbleGameService.create(gamePlayCreate);
		messagingTemplate.convertAndSend("/topic/game-plays/" + gamePlayCreate.getGamePlayId(),
				gamePlay);
	}
}
