package com.meeple.meeple_back.game.catchmind;

import com.meeple.meeple_back.admin.ai.model.response.ResponseSessionAndToken;
import com.meeple.meeple_back.game.catchmind.model.GameResultDTO;
import com.meeple.meeple_back.game.catchmind.model.MessageDTO;
import com.meeple.meeple_back.game.catchmind.model.RoomInfoDTO;
import com.meeple.meeple_back.game.catchmind.model.entity.Quiz;
import com.meeple.meeple_back.game.catchmind.model.request.RequestCatchMindReady;
import com.meeple.meeple_back.game.catchmind.model.request.RequestCreateRoom;
import com.meeple.meeple_back.game.catchmind.model.request.RequestJoinRoom;
import com.meeple.meeple_back.game.catchmind.model.request.RequestSendMessage;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseCatchMindReady;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseCreateRoom;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseJoinRoom;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseSendMessage;
import com.meeple.meeple_back.game.catchmind.repository.QuizRepository;
import com.meeple.meeple_back.game.catchmind.service.CatchMindServiceImpl;
import com.meeple.meeple_back.game.cockroach.model.entity.ChatMessage;
import com.meeple.meeple_back.game.cockroach.model.entity.Room;
import com.meeple.meeple_back.game.cockroach.repository.ChatMessageRespository;
import com.meeple.meeple_back.game.cockroach.repository.RoomRepository;
import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.openVidu.service.OpenViduService;
import com.meeple.meeple_back.game.repo.GameRepository;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CatchmindServiceTest {

    // 모킹 대상
    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private HashOperations<String, Object, Object> hashOps;

    @Mock
    private ChatMessageRespository chatMessageRespository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private SimpMessageSendingOperations messagingTemplate;

    @Mock
    private GameRepository gameRepository;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OpenViduService openViduService;

    @InjectMocks
    private CatchMindServiceImpl catchMindServiceImpl;

    private static final String ROOM_KEY = "CATCH_MIND_GAME_ROOMS";
    private static final String AI_KEY = "AI_APP_STATUS";

    @BeforeEach
    void setUp() {
        // redisTemplate의 opsForHash()가 hashOps를 반환하도록 설정 (lenient()로 불필요 stubbing 경고 완화)
        lenient().when(redisTemplate.opsForHash()).thenReturn(hashOps);
    }

    @Test
    void testCreateRoom_Success() throws Exception {
        // Arrange
        RequestCreateRoom request = new RequestCreateRoom();
        request.setCreator("testCreator");
        request.setGameId(1);
        request.setRoomTitle("Test Room");
        request.setPrivate(true);
        request.setPassword("pass");
        request.setMaxPeople(4);
        request.setQuizCount(3);
        request.setTimeLimit(60);

        // AI 프로그램 켜짐
        when(hashOps.get(AI_KEY, "testCreator")).thenReturn("ON");

        // gameRepository.findById
        Game game = new Game();
        game.setGameId(1);
        when(gameRepository.findById(1)).thenReturn(Optional.of(game));

        // roomRepository.save -> 저장 후 roomId 할당(예: 100)
        Room room = Room.builder().roomId(100).roomName("Test Room").build();
        when(roomRepository.save(any(Room.class))).thenReturn(room);

        // openViduService.createSession
        when(openViduService.createSession()).thenReturn("session123");

        // Act
        ResponseCreateRoom response = catchMindServiceImpl.createRoom(request);

        // Assert
        assertThat(response.getCode()).isEqualTo(200);
        assertThat(response.getMessage()).isEqualTo("방 생성 성공");
        assertThat(response.getRoomId()).isEqualTo(100);
        assertThat(response.getCreator()).isEqualTo("testCreator");
        assertThat(response.getSessionId()).isEqualTo("session123");

        // verify: Redis에 방 정보 저장, 메시지 전송
        verify(hashOps).put(eq(ROOM_KEY), eq("100"), any(Map.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/ai-recordtestCreator"), eq("녹음 시작"));
    }

    @Test
    void testCreateRoom_AIProgramOff() {
        // Arrange
        RequestCreateRoom request = new RequestCreateRoom();
        request.setCreator("testCreator");
        request.setGameId(1);
        request.setRoomTitle("Test Room");
        request.setPrivate(true);
        request.setPassword("pass");
        request.setMaxPeople(4);
        request.setQuizCount(3);
        request.setTimeLimit(60);

        // AI 프로그램 꺼짐
        when(hashOps.get(AI_KEY, "testCreator")).thenReturn("OFF");

        // Act
        ResponseCreateRoom response = catchMindServiceImpl.createRoom(request);

        // Assert
        assertThat(response.getCode()).isEqualTo(400);
        assertThat(response.getMessage()).isEqualTo("AI 프로그램을 켰는지 확인해주세요");
    }

    @Test
    void testJoinRoom_Success() {
        // Arrange
        RequestJoinRoom request = new RequestJoinRoom();
        request.setRoomId(100);
        request.setPlayerName("testPlayer");
        request.setPassword("pass");

        // AI 프로그램 켜짐
        when(hashOps.get(AI_KEY, "testPlayer")).thenReturn("ON");

        // 준비된 방 정보 생성
        Map<String, Object> roomInfo = new HashMap<>();
        roomInfo.put("isPrivate", true);
        roomInfo.put("password", "pass");
        // 기존 플레이어 리스트에 한 명 포함
        List<String> players = new ArrayList<>(Collections.singletonList("existingPlayer"));
        roomInfo.put("players", players);
        when(hashOps.get(ROOM_KEY, "100")).thenReturn(roomInfo);

        // Act
        ResponseJoinRoom response = catchMindServiceImpl.joinRoom(request);

        // Assert
        assertThat(response.getCode()).isEqualTo(200);
        assertThat(response.getMessage()).contains("입장 성공");
        assertThat(response.getRoomInfo()).isEqualTo(roomInfo);

        verify(messagingTemplate).convertAndSend(eq("/topic/ai-recordtestPlayer"), eq("녹음 시작"));
        verify(hashOps).put(eq(ROOM_KEY), eq("100"), eq(roomInfo));
    }

    @Test
    void testJoinRoom_RoomNotFound() {
        // Arrange
        RequestJoinRoom request = new RequestJoinRoom();
        request.setRoomId(100);
        request.setPlayerName("testPlayer");
        request.setPassword("pass");

        when(hashOps.get(AI_KEY, "testPlayer")).thenReturn("ON");
        when(hashOps.get(ROOM_KEY, "100")).thenReturn(null);

        // Act
        ResponseJoinRoom response = catchMindServiceImpl.joinRoom(request);

        // Assert
        assertThat(response.getCode()).isEqualTo(404);
        assertThat(response.getMessage()).isEqualTo("방을 찾을 수 없습니다.");
    }

    @Test
    void testSendMessage_System() {
        // Arrange
        String roomId = "100";
        RequestSendMessage request = new RequestSendMessage();
        request.setSender("SYSTEM");
        request.setMessage("Test system message");

        // Act
        ResponseSendMessage response = catchMindServiceImpl.sendMessage(roomId, request);

        // Assert
        assertThat(response.getType()).isEqualTo("message");
        // 시스템 메시지인 경우 추가 로직 없이 바로 리턴하므로 message 내용이 null이어도 무관
        assertThat(response).isNotNull();
    }

    @Test
    void testReadyRoom_Toggle() {
        // Arrange
        String roomId = "100";
        // 미리 readyPlayer 셋을 포함하는 방 정보 생성
        Set<String> readyPlayer = new HashSet<>();
        readyPlayer.add("player1");
        Map<String, Object> roomInfo = new HashMap<>();
        roomInfo.put("readyPlayer", readyPlayer);
        when(hashOps.get(ROOM_KEY, roomId)).thenReturn(roomInfo);

        RequestCatchMindReady request = new RequestCatchMindReady();
        request.setUserNickname("player2");

        // Act: 처음 호출 → player2 추가
        ResponseCatchMindReady response = catchMindServiceImpl.readyRoom(roomId, request);
        assertThat(response.getReadyPlayers()).contains("player1", "player2");

        // Act: 다시 호출 → player2 제거
        ResponseCatchMindReady response2 = catchMindServiceImpl.readyRoom(roomId, request);
        assertThat(response2.getReadyPlayers()).containsExactly("player1");
    }
}
