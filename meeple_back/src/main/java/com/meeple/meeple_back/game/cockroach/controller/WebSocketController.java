package com.meeple.meeple_back.game.cockroach.controller;

import com.meeple.meeple_back.game.cockroach.model.request.RequestCheckCard;
import com.meeple.meeple_back.game.cockroach.model.request.RequestGiveCard;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseCheckCard;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseGiveCard;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseStartGame;
import com.meeple.meeple_back.game.cockroach.service.CockroachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
public class WebSocketController {

    private final CockroachService cockroachService;

    @Autowired
    public WebSocketController(CockroachService cockroachService) {
        this.cockroachService = cockroachService;
    }

    /**
     * 채팅 메시지를 처리하는 메서드
     *
     * @param roomId  메시지가 전송된 방의 ID (URL 경로에서 추출)
     * @param message 클라이언트가 전송한 메시지 (단순 텍스트)
     * @return 클라이언트로 브로드캐스트할 메시지
     */
    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/messages/{roomId}")
    public String handleMessage(@DestinationVariable String roomId, String message) {
        // 받은 메시지를 콘솔에 출력 (디버깅용)
        System.out.println("Received message in room " + roomId + ": " + message);
        // 메시지를 그대로 반환하여 구독 중인 클라이언트들에게 브로드캐스트
        return message;
    }

    /**
     * 게임 이벤트를 처리하는 메서드
     *
     * @param gameEvent 클라이언트가 전송한 게임 이벤트 데이터 (JSON 형식으로 매핑)
     * @return 클라이언트로 브로드캐스트할 게임 이벤트 데이터
     */
    @MessageMapping("/game/{roomId}")
    @SendTo("/topic/game/{roomId}")
    public Map<String, Object> handleGameEvent(Map<String, Object> gameEvent) {
        // 받은 게임 이벤트 데이터를 콘솔에 출력 (디버깅용)
        System.out.println("Received game event: " + gameEvent);

        // 게임 이벤트 데이터를 그대로 반환하여 구독 중인 클라이언트들에게 브로드캐스트
        return gameEvent;
    }

    // MessageMapping 경로를 분리해서 행위별로 구분
    @MessageMapping("/game/start-game/{roomId}")
    @SendTo("/topic/game/{roomId}")
    public ResponseStartGame startGame(
        @DestinationVariable String roomId
    ) {
        System.out.println("게임 시작 호출");
        return cockroachService.startGame(roomId);
    }

    @MessageMapping("/game/give-card/{roomId}")
    @SendTo("/topic/game/{roomId}")
    public ResponseGiveCard giveCard(
            @DestinationVariable String roomId,
            @RequestBody RequestGiveCard request
            ) {

        return cockroachService.giveCard(roomId, request);
    }

    @MessageMapping("/game/check-card/{roomId}")
    @SendTo("/topic/game/{roomId}")
    public ResponseCheckCard checkCard(
            @DestinationVariable String roomId,
            @RequestBody RequestCheckCard request
            ) {

        return cockroachService.checkCard(roomId, request);
    }
}
