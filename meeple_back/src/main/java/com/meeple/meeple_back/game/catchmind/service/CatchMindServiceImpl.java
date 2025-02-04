package com.meeple.meeple_back.game.catchmind.service;

import com.meeple.meeple_back.game.catchmind.model.MessageType;
import com.meeple.meeple_back.game.catchmind.model.entity.Quiz;
import com.meeple.meeple_back.game.catchmind.model.request.*;
import com.meeple.meeple_back.game.catchmind.model.response.*;
import com.meeple.meeple_back.game.catchmind.repository.QuizRepository;
import com.meeple.meeple_back.game.cockroach.model.entity.ChatMessage;
import com.meeple.meeple_back.game.cockroach.model.entity.Room;
import com.meeple.meeple_back.game.cockroach.repository.ChatMessageRespository;
import com.meeple.meeple_back.game.cockroach.repository.RoomRepository;
import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.repo.GameRepository;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CatchMindServiceImpl implements CatchMindService {
    private static final String ROOM_KEY = "CATCH_MIND_GAME_ROOMS";
    private final RedisTemplate<String, Object> redisTemplate;
    private final ChatMessageRespository chatMessageRespository;
    private final RoomRepository roomRepository;
    private final SimpMessageSendingOperations messagingTemplate;
    private final GameRepository gameRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    /* 게임방 로직 */
    @Override
    public ResponseCreateRoom createRoom(RequestCreateRoom request) {
        Map<String, Object> roomInfo = new HashMap<>();

        List<String> players = new ArrayList<>();

        players.add(request.getCreator());

        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 게임 ID입니다."));

        Room room = Room.builder()
                .roomName(request.getRoomTitle())
                .createTime(LocalDateTime.now())
                .game(game)
                .build();

        Room savedRoom = roomRepository.save(room);

        roomInfo.put("roomId", savedRoom.getRoomId());
        roomInfo.put("players", players);
        roomInfo.put("gameData", new HashMap<>());
        roomInfo.put("gameType", "캐치마인드");
        roomInfo.put("isPrivate", request.isPrivate());
        roomInfo.put("password", request.getPassword());
        roomInfo.put("isGameStart", false);
        roomInfo.put("creator", request.getCreator());
        roomInfo.put("maxPeople", request.getMaxPeople());
        roomInfo.put("quizCount", request.getQuizCount());
        roomInfo.put("timeLimit", request.getTimeLimit());
        roomInfo.put("roomTitle", request.getRoomTitle());


        redisTemplate.opsForHash().put(ROOM_KEY, savedRoom.getRoomId() + "", roomInfo);

        ResponseCreateRoom response = ResponseCreateRoom.builder()
                .roomId(savedRoom.getRoomId())
                .build();

        return response;
    }

    @Override
    public ResponseJoinRoom joinRoom(RequestJoinRoom request) {
        // 명시적 문자열 변환
        String roomIdStr = String.valueOf(request.getRoomId());

        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomIdStr);

        if (roomInfo == null) {
            return ResponseJoinRoom.builder()
                    .code(404)
                    .message("방을 찾을 수 없습니다.")
                    .build();
        }

        boolean isPrivate = Boolean.parseBoolean(String.valueOf(roomInfo.get("isPrivate")));

        if (isPrivate) {
            if (!roomInfo.get("password").equals(request.getPassword())) {
                return ResponseJoinRoom.builder()
                        .code(400)
                        .message("비밀번호 불일치")
                        .build();
            }
        }

        // 기존 players 리스트를 새로운 리스트로 교체
        List<String> currentPlayers = (List<String>) roomInfo.get("players");
        List<String> updatedPlayers;

        if (currentPlayers == null || currentPlayers.isEmpty()) {
            updatedPlayers = new ArrayList<>();
            updatedPlayers.add(request.getPlayerName());
        } else {
            // 기존 플레이어 목록에서 null 제거, 중복 제거하고 현재 플레이어 추가
            updatedPlayers = currentPlayers.stream()
                    .filter(Objects::nonNull)  // null 제거
                    .distinct()                // 중복 제거
                    .collect(Collectors.toList());

            // 현재 플레이어가 목록에 없을 경우에만 추가
            if (!updatedPlayers.contains(request.getPlayerName())) {
                updatedPlayers.add(request.getPlayerName());
            }
        }

        // 정제된 플레이어 리스트로 업데이트
        roomInfo.put("players", updatedPlayers);
        redisTemplate.opsForHash().put(ROOM_KEY, roomIdStr, roomInfo);

        return ResponseJoinRoom.builder()
                .code(200)
                .message(request.getPlayerName() + " " + roomIdStr + "번 방 입장 성공")
                .roomInfo(roomInfo)
                .build();
    }

    @Override
    public ResponseUpdateRoom updateRoom(String roomId, RequestUpdateRoom request) {
        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

        if (!request.getRoomTitle().equals(roomInfo.get("roomTitle"))) {
            roomInfo.put("roomTitle", request.getRoomTitle());
        }

        if (request.isPrivate() != Boolean.parseBoolean(String.valueOf(roomInfo.get("isPrivate")))) {
            roomInfo.put("isPrivate", request.isPrivate());
        }

        if (!request.getPassword().equals(roomInfo.get("password"))) {
            roomInfo.put("password", request.getPassword());
        }

        if (request.getMaxPeople() != Integer.parseInt(String.valueOf(roomInfo.get("password")))) {
            roomInfo.put("maxPeople", request.getMaxPeople());
        }

        if (request.getTimeLimit() != Integer.parseInt(String.valueOf(roomInfo.get("timeLimit")))) {
            roomInfo.put("timeLimit", request.getTimeLimit());
        }

        if (request.getQuizCount() != Integer.parseInt(String.valueOf(roomInfo.get("quizCount")))) {
            roomInfo.put("quizCount", request.getQuizCount());
        }

        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

        ResponseUpdateRoom response = ResponseUpdateRoom.builder()
                .roomTitle(request.getRoomTitle())
                .isPrivate(request.isPrivate())
                .password(request.getPassword())
                .maxPeople(request.getMaxPeople())
                .timeLimit(request.getTimeLimit())
                .quizCount(request.getQuizCount())
                .build();

        return response;
    }

    @Override
    public List<Map<String, Object>> getList() {
        return redisTemplate.opsForHash()
                .values(ROOM_KEY)
                .stream()
                .map(obj -> (Map<String, Object>) obj)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteRoom(String roomId) {
        redisTemplate.opsForHash().delete(ROOM_KEY, roomId);
    }


    /* 게임 로직 */
    @Override
    public ResponseStartGame startGame(String roomId) {
        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

        List<Quiz> quizList = quizRepository.findAll();
        List<String> players = (List<String>) roomInfo.get("players");

        Collections.shuffle(quizList);
        Collections.shuffle(players);
        quizList = quizList.subList(0, (Integer) roomInfo.get("quizCount"));

        Map<String, Object> gameInfo = new HashMap<>();

        Map<String, Integer> playerScore = new HashMap<>();

        for (String player : players) {
            playerScore.put(player, 0);
        }

        gameInfo.put("quizList", quizList);
        gameInfo.put("sequence", players);
        gameInfo.put("playerScore", playerScore);

        roomInfo.put("gameInfo", gameInfo);
        roomInfo.put("isGameStart", true);

        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);


        ResponseStartGame response = ResponseStartGame.builder()
                .quizList(quizList)
                .sequence(players)
                .build();

        return response;
    }


    @Override
    public ResponseQuiz requestQuiz(String roomId) {
//        Map<String, Object> roomInfo =
//                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);
//
//        Map<String, Object> gameInfo = (Map<String, Object>) roomInfo.get("gameInfo");
//
//        List<Quiz> quizList = (List<Quiz>) gameInfo.get("quizList");
//
//        Quiz quiz = quizList.get(0);
//        quizList.remove(0);
//
//        ResponseQuiz response = ResponseQuiz.builder()
//                .quiz(quiz.getQuiz())
//                .quizCategory(quiz.getQuizCategory().getQuizCategory())
//                .remainQuizCount(quizList.size())
//                .build();
//
//        gameInfo.put("quizList", quizList);
//        roomInfo.put("gameInfo", gameInfo);
//        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

//        return response;
        return null;
    }

    @Override
    public ResponseSendMessage sendMessage(String roomId, RequestSendMessage request) {
        if (roomId == null || roomId.isEmpty()) {
            throw new IllegalArgumentException("유효하지 않은 roomId 입니다.");
        }

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("빈 메세지는 전송할 수 없습니다.");
        }

        Map<String, Object> roomInfo = (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

        if (roomInfo == null) {
            ResponseSendMessage response = ResponseSendMessage.builder()
                    .messageType(MessageType.ERROR)
                    .code(404)
                    .responseMessage(roomId + "번은 존재하지 않는 방번호입니다.")
                    .build();

            return response;
        }

        User sender = userRepository.findByUserNickname(request.getSender());
        if (sender == null) {
            throw new IllegalArgumentException("존재하지 않는 사용자입니다: " + request.getSender());
        }

        Room room = roomRepository.findById(Integer.parseInt(roomId))
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 게임방"));

        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(room)
                .sender(sender)
                .content(request.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        chatMessageRespository.save(chatMessage);


        // 정답 체크
        if (request.getCorrectAnswer() != null &&
                request.getMessage().trim().equalsIgnoreCase(request.getCorrectAnswer().trim())) {

            // 1. gameInfo 가져오기 또는 초기화
            Map<String, Object> gameInfo = (Map<String, Object>) roomInfo.get("gameInfo");
            if (gameInfo == null) {
                gameInfo = new HashMap<>();
                roomInfo.put("gameInfo", gameInfo);
            }

            // 2. 플레이어 점수 업데이트
            Map<String, Integer> playerScore = (Map<String, Integer>) gameInfo.get("playerScore");
            if (playerScore == null) {
                playerScore = new HashMap<>();
                gameInfo.put("playerScore", playerScore);
            }

            int currentScore = playerScore.getOrDefault(request.getSender(), 0);
            playerScore.put(request.getSender(), currentScore + 10);

            // 3. 다음 출제자로 턴 변경
            List<String> players = (List<String>) roomInfo.get("players");
            String nextTurn = "";
            if (players != null && !players.isEmpty()) {
                String currentTurn = (String) gameInfo.get("currentTurn");
                int currentIndex = currentTurn != null ? players.indexOf(currentTurn) : 0;
                int nextIndex = (currentIndex + 1) % players.size();
                nextTurn = players.get(nextIndex);

                // 다음 출제자를 gameInfo에 저장
                gameInfo.put("currentTurn", nextTurn);
            }

            List<Quiz> quizList = (List<Quiz>) gameInfo.get("quizList");

            Quiz quiz = quizList.get(0);
            quizList.remove(0);


            // 4. Redis에 업데이트된 정보 저장
            gameInfo.put("quizList", quizList);
            roomInfo.put("gameInfo", gameInfo);
            redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

            // 5. 게임 상태 변경 알림
            messagingTemplate.convertAndSend("/topic/catch-mind/" + roomId, roomInfo);

            // 6. 정답 메시지 전송
            ResponseSendMessage response = ResponseSendMessage.builder()
                    .messageType(MessageType.SYSTEM)
                    .code(200)
                    .responseMessage("정상 작동")
                    .sender(sender.getUserNickname())
                    .content(request.getMessage())
                    .nextTurn(nextTurn)
                    .nextAnswer(quiz.getQuiz())
                    .remainQuizCount(quizList.size())
                    .timestamp(LocalDateTime.now())
                    .score(10)
                    .isCorrect(true)
                    .build();

            return response;
            // 7. 시스템 알림 메시지 전송
//            ResponseSendMessage noticeMessage = ResponseSendMessage.builder()
//                    .sender("SYSTEM")
//                    .content(String.format("%s님이 정답을 맞추셨습니다! (정답: %s)",
//                            sender.getUserNickname(), request.getCorrectAnswer()))
//                    .timestamp(LocalDateTime.now())
//                    .isNotice(true)
//                    .build();
//            messagingTemplate.convertAndSend("/topic/catch-mind-messages/" + roomId, noticeMessage);

        } else {
            // 일반 메시지 전송
            ResponseSendMessage response = ResponseSendMessage.builder()
                    .messageType(MessageType.NORMAL)
                    .code(200)
                    .responseMessage("성공적으로 반환되었습니다.")
                    .sender(sender.getUserNickname())
                    .content(request.getMessage())
                    .timestamp(LocalDateTime.now())
                    .isCorrect(false)
                    .score(0)
                    .build();

            return response;
        }
    }

    @Override
    public List<ResponseGameResult> gameResult(String roomId) {
        Map<String, Object> roomInfo = (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);
        Map<String, Object> gameInfo = (Map<String, Object>) roomInfo.get("gameInfo");
        Map<String, Integer> playerScore = (Map<String, Integer>) gameInfo.get("playerScore");

        List<ResponseGameResult> response = new ArrayList<>();

        for (String player : playerScore.keySet()) {
            int score = playerScore.get(player);
            ResponseGameResult result = ResponseGameResult.builder()
                    .point(score)
                    .player(player)
                    .build();

            response.add(result);
        }

        response = response.stream()
                .sorted(Comparator.comparingInt(ResponseGameResult::getPoint).reversed())
                .collect(Collectors.toList());

        int rank = 1;
        for (int i = 0; i < response.size(); i++) {
            if (i > 0 && response.get(i).getPoint() < response.get(i - 1).getPoint()) {
                rank = i + 1; // 동일 점수가 아닐 경우 rank 갱신
            }
            response.get(i).setRank(rank); // rank 설정
        }

        return response;
    }

    @Override
    public ResponseSendVote sendVote(String roomId, RequestSendVote request) {
        ResponseSendVote response = ResponseSendVote.builder()
                .voteTarget(request.getVoteTarget())
                .build();

        return response;
    }

    @Override
    public ResponseVote vote(RequestVote request) {
        ResponseVote response = ResponseVote.builder()
                .isApproval(request.isApproval())
                .voter(request.getVoter())
                .build();

        return response;
    }

    @Override
    public ResponseVoteResult voteResult(String roomId, RequestVoteResult request) {
        if (request.isResult()) {
            Map<String, Object> roomInfo = (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);
            List<String> players = (List<String>) roomInfo.get("players");

            for (int i = 0; i < players.size(); i++) {
                if (request.getTarget().equals(players.get(i))) {
                    players.remove(i);
                    break;
                }
            }

            roomInfo.put("players", players);
            redisTemplate.opsForHash().put(ROOM_KEY, roomId, players);

            ResponseVoteResult response = ResponseVoteResult.builder()
                    .isLeave(true)
                    .target(request.getTarget())
                    .build();

            return response;
        } else {
            ResponseVoteResult response = ResponseVoteResult.builder()
                    .target(request.getTarget())
                    .isLeave(false)
                    .build();

            return response;
        }
    }

    @Override
    public ResponseExitCatchmindRoom exitRoom(String roomId, String userName) {
        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

        List<String> userList = (List<String>) roomInfo.get("players");

        if (!userName.equals(roomInfo.get("creator"))) {
            for (int i = 0; i < userList.size(); i++) {
                String user = userList.get(i);
                if (user.equals(userName)) {
                    userList.remove(i);
                    break;
                }
            }
        } else {
            for (int i = 0; i < userList.size(); i++) {
                if (!userList.get(i).equals(roomInfo.get("creator"))) {
                    roomInfo.put("creator", userList.get(i));
                    break;
                }
            }

            for (int i = 0; i < userList.size(); i++) {
                if (userList.get(i).equals(userName)) {
                    userList.remove(i);
                    break;
                }
            }
        }

        roomInfo.put("players", userList);
        if (userList.size() == 0) {
            redisTemplate.opsForHash().delete(ROOM_KEY, roomId);
        } else {
            redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);
        }

        return ResponseExitCatchmindRoom.builder()
                .players(userList)
                .build();
    }
}