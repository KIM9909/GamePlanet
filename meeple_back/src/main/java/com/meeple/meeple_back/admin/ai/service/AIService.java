package com.meeple.meeple_back.admin.ai.service;

import com.meeple.meeple_back.admin.ai.model.request.RequestLogin;
import com.meeple.meeple_back.admin.ai.model.response.ResponseCreateVoiceLog;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogin;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogout;
import org.springframework.web.multipart.MultipartFile;

public interface AIService {
    ResponseLogin login(RequestLogin request);

    ResponseCreateVoiceLog createVoiceLog(MultipartFile audio,
        String convertResult, String userNickname);

    ResponseLogout logout(String userNickname);
}
