package com.meeple.meeple_back.admin.ai.service;

import com.meeple.meeple_back.admin.ai.model.entity.VoiceLog;
import com.meeple.meeple_back.admin.ai.model.request.RequestLogin;
import com.meeple.meeple_back.admin.ai.model.response.ResponseCreateVoiceLog;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogin;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogout;
import com.meeple.meeple_back.admin.ai.repo.VoiceLogRepository;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@AllArgsConstructor
public class AIServiceImpl implements AIService{
    private static final String ROOM_KEY = "AI_APP_STATUS";
    private final UserRepository  userRepository;
    private final VoiceLogRepository voiceLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;


    /* redis에 클라이언트 켜짐 추가 */
    @Override
    public ResponseLogin login(RequestLogin request) {
        User user = userRepository.findByUserEmail(request.getUserEmail())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 이메일입니다."));

        if (passwordEncoder.matches(request.getPassword(), user.getUserPassword())) {
            System.out.println("일치");
            ResponseLogin response = ResponseLogin.builder()
                    .isSuccess(true)
                    .userId(user.getUserId())
                    .userNickname(user.getUserNickname())
                    .build();

            redisTemplate.opsForHash().put(ROOM_KEY, user.getUserNickname(), "ON");

            return response;
        } else {
            System.out.println("불일치");
            ResponseLogin response = ResponseLogin.builder()
                    .isSuccess(false)
                    .build();

            return response;
        }
    }

    @Override
    public ResponseLogout logout(String userNickname) {
        redisTemplate.opsForHash().delete(ROOM_KEY, userNickname);
        ResponseLogout response = ResponseLogout.builder()
            .code(200)
            .message("로그아웃 성공")
            .build();

        return response;
    }

    @Override
    public ResponseCreateVoiceLog createVoiceLog(MultipartFile audio, String convertResult,
        String userNickname) {
        User user = userRepository.findByUserNickname(userNickname);

        VoiceLog voiceLog = new VoiceLog();
        voiceLog.setUser(user);
        voiceLog.setVoiceLog(convertResult);
        voiceLog.setVoiceTime(LocalDateTime.now());
        voiceLog.setVoiceFileUrl("S3 필요");

        VoiceLog savedvoiceLog = voiceLogRepository.save(voiceLog);

        ResponseCreateVoiceLog response = ResponseCreateVoiceLog.builder()
            .code(200)
            .message("저장 성공")
            .voiceLog(savedvoiceLog)
            .build();

        return response;
    }
}
