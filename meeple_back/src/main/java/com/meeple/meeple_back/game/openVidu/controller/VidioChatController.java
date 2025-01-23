package com.meeple.meeple_back.game.openVidu.controller;

import com.meeple.meeple_back.game.openVidu.service.OpenViduService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/video")
public class VidioChatController {

    private OpenViduService openViduService;

    @Autowired
    public VidioChatController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }

    @PostMapping("/create-session")
    public ResponseEntity<String> createSession() {
        try {
            String sessionId = openViduService.createSession();
            return ResponseEntity.ok(sessionId);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("세션 생성 중 오류 발생: " + e.getMessage());
        }
    }

    @PostMapping("gernerate-token/{sessionId}")
    public ResponseEntity<String> generateToken(@PathVariable String sessionId) {
        try {
            String token = openViduService.generateToken(sessionId);
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("토큰 생성 중 에러 발생: " + e.getMessage());
        }
    }
}
