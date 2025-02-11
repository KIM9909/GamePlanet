package com.meeple.meeple_back.admin.ai.controller;

import com.meeple.meeple_back.admin.ai.model.request.RequestCreateVoiceLog;
import com.meeple.meeple_back.admin.ai.model.request.RequestGiveStream;
import com.meeple.meeple_back.admin.ai.model.request.RequestLogin;
import com.meeple.meeple_back.admin.ai.model.response.ResponseCreateVoiceLog;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogin;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogout;
import com.meeple.meeple_back.admin.ai.service.AIService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping( value = "/voice-log", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseCreateVoiceLog> createVoiceLog(
        @RequestPart("audio") MultipartFile audio,
        @RequestPart("voiceLog") String convertResult,
        @RequestPart("userNickname") String userNickname
    ) {
        ResponseCreateVoiceLog response = aiService.createVoiceLog(audio, convertResult, userNickname);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/logout")
    public ResponseEntity<ResponseLogout> logout(
        @RequestParam String userNickname
    ) {
        ResponseLogout response = aiService.logout(userNickname);

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
        System.out.println("유저 닉네임: " + nickname);
        System.out.println("유저 닉네임: " + nickname);
        System.out.println("유저 닉네임: " + nickname);
        System.out.println("=====================================");
        System.out.println("유저 스트림: " + request.getUserStream());
        System.out.println("유저 스트림: " + request.getUserStream());
        System.out.println("유저 스트림: " + request.getUserStream());

        messagingTemplate.convertAndSend("/topic/vidu-stream/" + nickname, request.getUserStream());
    }
}
