package com.meeple.meeple_back.game.cockroach.controller;

import com.meeple.meeple_back.game.cockroach.model.request.RequestMultiCard;
import com.meeple.meeple_back.game.cockroach.model.request.RequestSingleCard;
import com.meeple.meeple_back.game.cockroach.model.request.RequestGiveCard;
import com.meeple.meeple_back.game.cockroach.model.request.RequestSendMessage;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseCheckCard;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseGiveCard;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseMultiCard;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseStartGame;
import com.meeple.meeple_back.game.cockroach.service.CockroachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class WebSocketController {

    private final CockroachService cockroachService;
    private final SimpMessageSendingOperations messagingTemplate;

    @Autowired
    public WebSocketController(CockroachService cockroachService,
        SimpMessageSendingOperations messagingTemplate) {
        this.cockroachService = cockroachService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat/{roomId}")
    public void handleMessage(
        @DestinationVariable String roomId,
        @RequestBody RequestSendMessage request) {
        if (roomId == null || roomId.isEmpty()) {
            throw new IllegalArgumentException("유효하지 않은 roomId 입니다.");
        }

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("빈 메세지는 전송할 수 없습니다.");
        }

        // 받은 메시지를 콘솔에 출력 (디버깅용)
        System.out.println("Received message in room " + roomId + ": "
            + request.getMessage());

        cockroachService.sendMessage(roomId, request);
    }


    // MessageMapping 경로를 분리해서 행위별로 구분
    @MessageMapping("/game/start-game/{roomId}")
    public void startGame(
        @DestinationVariable String roomId
    ) {
        System.out.println("게임 시작 호출");
        ResponseStartGame response = cockroachService.startGame(roomId);

        messagingTemplate.convertAndSend("/topic/game/" + roomId, response);
    }

    @MessageMapping("/game/give-card/{roomId}")
    public void giveCard(
        @DestinationVariable String roomId,
        @RequestBody RequestGiveCard request
    ) {
        ResponseGiveCard response = cockroachService.giveCard(roomId, request);

        messagingTemplate.convertAndSend("/topic/game/" + roomId, response);
    }

    @MessageMapping("/game/single-card/{roomId}")
    public void singleCard(
        @DestinationVariable String roomId,
        @RequestBody RequestSingleCard request
    ) {
        ResponseCheckCard response = cockroachService.singleCard(roomId, request);

        messagingTemplate.convertAndSend("/topic/game/" + roomId, response);
    }

    @MessageMapping("/game/multi-card/{roomId}")
    public void multiCard(
        @DestinationVariable String roomId,
        @RequestBody RequestMultiCard request
    ) {
        ResponseMultiCard response = cockroachService.multiCard(roomId, request);

        messagingTemplate.convertAndSend("/topic/game/" + roomId, response);
    }

}
