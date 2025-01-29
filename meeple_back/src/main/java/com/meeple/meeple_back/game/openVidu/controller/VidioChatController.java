package com.meeple.meeple_back.game.openVidu.controller;

import com.meeple.meeple_back.game.openVidu.service.OpenViduService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * OpenVidu 화상 채팅 기능을 위한 REST API 컨트롤러
 * 세션 생성과 토큰 발급을 처리합니다.
 */
@RestController
@RequestMapping("/api/video")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // React 프론트엔드와의 CORS 설정
public class VidioChatController {

    private final OpenViduService openViduService;

    @Autowired
    public VidioChatController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }

    /**
     * 새로운 화상 채팅 세션을 생성합니다.
     * @return 생성된 세션 ID를 포함한 응답
     */
    @PostMapping("/create-session")
    public ResponseEntity<Map<String, String>> createSession() {
        try {
            String sessionId = openViduService.createSession();
            Map<String, String> response = new HashMap<>();
            response.put("sessionId", sessionId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            // 에러 발생 시 500 에러와 함께 에러 메시지 반환
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }
    }

    /**
     * 특정 세션에 참가하기 위한 토큰을 생성합니다.
     * @param sessionId 참가할 세션의 ID
     * @return 생성된 토큰을 포함한 응답
     */
    @PostMapping("/generate-token/{sessionId}")
    public ResponseEntity<Map<String, String>> generateToken(@PathVariable String sessionId) {
        try {
            String token = openViduService.generateToken(sessionId);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }
    }
}
