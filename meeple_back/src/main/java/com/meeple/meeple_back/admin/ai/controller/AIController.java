package com.meeple.meeple_back.admin.ai.controller;

import com.meeple.meeple_back.admin.ai.model.request.RequestGiveStream;
import com.meeple.meeple_back.admin.ai.model.request.RequestLogin;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogin;
import com.meeple.meeple_back.admin.ai.service.AIService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
@AllArgsConstructor
public class AIController {
    private AIService aiService;
    private final SimpMessageSendingOperations messagingTemplate;

    @PostMapping("/login")
    public ResponseEntity<ResponseLogin> login(
            @RequestBody RequestLogin request
    ) {
        ResponseLogin response = aiService.login(request);

        return ResponseEntity.ok(response);
    }

    @MessageMapping("/response/{userId}")
    public void responseTest(
            @DestinationVariable long userId
    ) {
        System.out.println("호출");
        messagingTemplate.convertAndSend("/topic/response-test", userId + "번 회원 연결 성공");
    }

    @MessageMapping("/give-stream/{nickname}")
    public void giveStream(
            @DestinationVariable String nickname,
            @RequestBody RequestGiveStream request
    ) {
        messagingTemplate.convertAndSend("/topic/vidu-stream", request.getUserStream());
    }
}
