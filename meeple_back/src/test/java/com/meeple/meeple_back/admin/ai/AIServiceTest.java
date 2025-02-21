package com.meeple.meeple_back.admin.ai;

import com.meeple.meeple_back.admin.ai.model.entity.VoiceLog;
import com.meeple.meeple_back.admin.ai.model.request.RequestLogin;
import com.meeple.meeple_back.admin.ai.model.request.RequestProcessVoiceLog;
import com.meeple.meeple_back.admin.ai.model.response.ResponseCreateVoiceLog;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogin;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogout;
import com.meeple.meeple_back.admin.ai.model.response.ResponseProcessVoiceLog;
import com.meeple.meeple_back.admin.ai.model.response.ResponseVoiceLog;
import com.meeple.meeple_back.admin.ai.model.response.ResponseVoiceLogList;
import com.meeple.meeple_back.admin.ai.repo.VoiceLogRepository;
import com.meeple.meeple_back.admin.ai.service.AIServiceImpl;
import com.meeple.meeple_back.aws.s3.service.S3Service;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AIServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private VoiceLogRepository voiceLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private S3Service s3Service;

    // redisTemplate.opsForHash() 반환값을 위한 모의 객체
    @Mock
    private HashOperations<String, Object, Object> hashOperations;

    @InjectMocks
    private AIServiceImpl aiService;

    @BeforeEach
    public void setUp() {
        // redisTemplate의 hashOperations를 모의 객체로 반환하도록 설정
       lenient().when(redisTemplate.opsForHash()).thenReturn(hashOperations);
    }

    // login() 테스트 - 성공 케이스
    @Test
    public void testLoginSuccess() {
        // given
        RequestLogin request = new RequestLogin();
        request.setUserEmail("test@example.com");
        request.setPassword("plainPassword");

        User user = new User();
        user.setUserId(1L);
        user.setUserNickname("TestUser");
        user.setUserPassword("encodedPassword");

        when(userRepository.findByUserEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("plainPassword", "encodedPassword")).thenReturn(true);

        // when
        ResponseLogin response = aiService.login(request);

        // then
        assertTrue(response.isSuccess());
        assertEquals(1L, response.getUserId());
        assertEquals("TestUser", response.getUserNickname());
        // redis에 등록했는지 확인
        verify(hashOperations).put("AI_APP_STATUS", "TestUser", "ON");
    }

    // login() 테스트 - 실패 케이스 (비밀번호 불일치)
    @Test
    public void testLoginFailure() {
        // given
        RequestLogin request = new RequestLogin();
        request.setUserEmail("test@example.com");
        request.setPassword("wrongPassword");

        User user = new User();
        user.setUserId(1L);
        user.setUserNickname("TestUser");
        user.setUserPassword("encodedPassword");

        when(userRepository.findByUserEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        // when
        ResponseLogin response = aiService.login(request);

        // then
        assertFalse(response.isSuccess());
        // redis에는 put 호출되지 않아야 함
        verify(hashOperations, never()).put(anyString(), any(), any());
    }

    // voiceLogList() 테스트
    @Test
    public void testVoiceLogList() {
        // given
        VoiceLog log1 = new VoiceLog();
        VoiceLog log2 = new VoiceLog();
        List<VoiceLog> voiceLogs = Arrays.asList(log1, log2);

        when(voiceLogRepository.findAll()).thenReturn(voiceLogs);

        // when
        ResponseVoiceLogList response = aiService.voiceLogList();

        // then
        assertEquals(200, response.getCode());
        assertEquals("정상 작동", response.getMessage());
        assertEquals(voiceLogs, response.getVoiceLogList());
    }

    // voiceLog() 테스트 - 존재하는 음성 로그
    @Test
    public void testVoiceLogFound() {
        // given
        long voiceLogId = 1L;
        VoiceLog voiceLog = new VoiceLog();
        voiceLog.setVoiceFileUrl("sampleUrl");

        when(voiceLogRepository.findById(voiceLogId)).thenReturn(Optional.of(voiceLog));

        // when
        ResponseVoiceLog response = aiService.voiceLog(voiceLogId);

        // then
        assertEquals(200, response.getCode());
        assertEquals("정상 작동", response.getMessage());
        assertEquals(voiceLog, response.getVoiceLog());
    }

    // voiceLog() 테스트 - 존재하지 않는 음성 로그
    @Test
    public void testVoiceLogNotFound() {
        // given
        long voiceLogId = 1L;
        when(voiceLogRepository.findById(voiceLogId)).thenReturn(Optional.empty());

        // when & then
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            aiService.voiceLog(voiceLogId);
        });
        assertEquals("존재하지 않는 음성 로그입니다.", exception.getMessage());
    }

    // processVoiceLog() 테스트 - BAN 처리 케이스
    @Test
    public void testProcessVoiceLogBan() {
        // given
        RequestProcessVoiceLog request = new RequestProcessVoiceLog();
        request.setVoiceLogId(1L);
        request.setVoiceLogProcessStatus("BAN");

        // 음성 로그에 연결된 사용자 생성
        VoiceLog voiceLog = new VoiceLog();
        User user = new User();
        user.setUserId(1L);
        voiceLog.setUser(user);
        voiceLog.setVoiceProcessStatus("N");

        when(voiceLogRepository.findById(1L)).thenReturn(Optional.of(voiceLog));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(voiceLogRepository.save(any(VoiceLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        ResponseProcessVoiceLog response = aiService.processVoiceLog(request);

        // then
        assertEquals(200, response.getCode());
        assertEquals("처리완료", response.getMessage());
        assertEquals("Y", response.getVoiceLog().getVoiceProcessStatus());
        assertNotNull(user.getUserDeletedAt());
        verify(userRepository).save(user);
        verify(voiceLogRepository).save(voiceLog);
    }

    // processVoiceLog() 테스트 - BAN이 아닌 일반 처리 케이스
    @Test
    public void testProcessVoiceLogNonBan() {
        // given
        RequestProcessVoiceLog request = new RequestProcessVoiceLog();
        request.setVoiceLogId(2L);
        request.setVoiceLogProcessStatus("NORMAL");

        VoiceLog voiceLog = new VoiceLog();
        User user = new User();
        user.setUserId(2L);
        voiceLog.setUser(user);
        voiceLog.setVoiceProcessStatus("N");

        when(voiceLogRepository.findById(2L)).thenReturn(Optional.of(voiceLog));
        when(voiceLogRepository.save(any(VoiceLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        ResponseProcessVoiceLog response = aiService.processVoiceLog(request);

        // then
        assertEquals(200, response.getCode());
        assertEquals("처리완료", response.getMessage());
        assertEquals("Y", response.getVoiceLog().getVoiceProcessStatus());
        // BAN이 아닌 경우, 회원 업데이트는 발생하지 않음
        verify(userRepository, never()).save(any(User.class));
        verify(voiceLogRepository).save(voiceLog);
    }

    // logout() 테스트
    @Test
    public void testLogout() {
        // given
        String userNickname = "TestUser";

        // when
        ResponseLogout response = aiService.logout(userNickname);

        // then
        assertEquals(200, response.getCode());
        assertEquals("로그아웃 성공", response.getMessage());
        verify(hashOperations).delete("AI_APP_STATUS", userNickname);
    }

    // createVoiceLog() 테스트
    @Test
    public void testCreateVoiceLog() throws Exception {
        // given
        MultipartFile audio = mock(MultipartFile.class);
        String convertResult = "transcribed text";
        String userNickname = "TestUser";
        String fileUrl = "http://s3.amazonaws.com/file";

        User user = new User();
        user.setUserNickname(userNickname);

        when(userRepository.findByUserNickname(userNickname)).thenReturn(user);
        when(s3Service.uploadFile(audio)).thenReturn(fileUrl);
        when(voiceLogRepository.save(any(VoiceLog.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // when
        ResponseCreateVoiceLog response = aiService.createVoiceLog(audio, convertResult, userNickname);

        // then
        assertEquals(200, response.getCode());
        assertEquals("저장 성공", response.getMessage());
        assertNotNull(response.getVoiceLog());
        assertEquals(user, response.getVoiceLog().getUser());
        assertEquals(convertResult, response.getVoiceLog().getVoiceLog());
        assertEquals("N", response.getVoiceLog().getVoiceProcessStatus());
        assertEquals(fileUrl, response.getVoiceLog().getVoiceFileUrl());
    }
}
