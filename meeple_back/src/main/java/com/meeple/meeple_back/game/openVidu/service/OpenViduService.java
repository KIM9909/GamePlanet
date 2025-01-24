package com.meeple.meeple_back.game.openVidu.service;

import io.openvidu.java.client.*;
import org.springframework.stereotype.Service;

@Service
public class OpenViduService {
    private OpenVidu openVidu;
    private String OPENVIDU_URL = "http://localhost:4443";
    private String SECRET = "MY_SECRET";

    public OpenViduService() {
        this.openVidu = new OpenVidu(OPENVIDU_URL, SECRET);
    }

    public String createSession() throws OpenViduJavaClientException, OpenViduHttpException {
        Session session = this.openVidu.createSession();
        return session.getSessionId(); // 세션 ID 반환
    }

    public String generateToken(String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
        Session session = this.openVidu.getActiveSession(sessionId);
        if (session == null) {
            throw new RuntimeException("Session not found");
        }
        return session.generateToken(new TokenOptions.Builder().build());
    }
}
