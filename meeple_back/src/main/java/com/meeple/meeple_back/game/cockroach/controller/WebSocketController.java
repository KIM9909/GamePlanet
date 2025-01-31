package com.meeple.meeple_back.game.cockroach.controller;

import com.meeple.meeple_back.game.cockroach.model.request.*;
import com.meeple.meeple_back.game.cockroach.model.response.*;
import com.meeple.meeple_back.game.cockroach.service.CockroachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
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

    @MessageMapping("/game/chat/{roomId}")
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

    @MessageMapping("/game/update-room/{roomId}")
    public void updateRoom(
            @DestinationVariable String roomId,
            @RequestBody RequestUpdateRoom request
    ) {
        ResponseUpdateRoom response = cockroachService.updateRoom(roomId, request);

        messagingTemplate.convertAndSend("/topic/game/" + roomId, response);
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

    @MessageMapping("/game/exit-room/{roomId}")
    public void exitRoom(
            @DestinationVariable String roomId,
            @PathVariable String userNickname
    ) {
        ResponseExitRoom response = cockroachService.exitRoom(roomId, userNickname);
        messagingTemplate.convertAndSend("/topic/game/" + roomId, response);
    }

    @MessageMapping("/game/send-vote/{roomId}")
    private void sendVote(
            @DestinationVariable String roomId,
            @RequestBody RequestSendVote request
    ) {
        ResponseSendVote response = cockroachService.sendVote(roomId, request);
        messagingTemplate.convertAndSend("/topic/game/" + roomId, response);
    }

    @MessageMapping("/game/vote/{roomId}")
    private void vote(
            @DestinationVariable String roomId,
            @RequestBody RequestVote request
    ) {
        ResponseVote response = cockroachService.vote(request);

        messagingTemplate.convertAndSend("/topic/game/" + roomId, response);
    }

    @MessageMapping("/game/vote-result/{roomId}")
    private void voteResult(
            @DestinationVariable String roomId,
            @RequestBody RequestVoteResult request
    ) {
        ResponseVoteResult response = cockroachService.voteResult(roomId, request);
        messagingTemplate.convertAndSend("/topic/game/" + roomId, response);
    }

    @MessageMapping("/game/hand-check/{roomId}")
    private void handCheck(
            @DestinationVariable String roomId,
            @RequestBody RequestHandCheck request
    ) {
        ResponseHandCheck response = cockroachService.handCheck(roomId, request);

        messagingTemplate.convertAndSend("/topic/game/" + roomId, response);
    }

}
