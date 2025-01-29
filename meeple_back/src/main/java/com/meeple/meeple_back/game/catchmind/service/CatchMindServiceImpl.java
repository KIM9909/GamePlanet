package com.meeple.meeple_back.game.catchmind.service;

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

        redisTemplate.opsForHash().put(ROOM_KEY, savedRoom.getRoomId() + "", roomInfo);

        ResponseCreateRoom response = ResponseCreateRoom.builder()
                .roomId(savedRoom.getRoomId())
                .build();

        return response;
    }

    @Override
    public ResponseJoinRoom joinRoom(RequestJoinRoom request) {
        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, request.getRoomId() + "");

        if (roomInfo != null) {
            List<String> players = (List<String>) roomInfo.get("players");
            players.add(request.getPlayerName());

            roomInfo.put("players", players);

            redisTemplate.opsForHash().put(ROOM_KEY, request.getRoomId(), roomInfo);

            ResponseJoinRoom response = ResponseJoinRoom.builder()
                    .code(200)
                    .message(request.getPlayerName() + " " + request.getRoomId() + "번 방 입장 성공")
                    .build();

            return response;
        } else {
            ResponseJoinRoom response = ResponseJoinRoom.builder()
                    .code(500)
                    .message(request.getPlayerName() + " " + request.getRoomId() + "번 방 입장 실패")
                    .build();

            return response;
        }
    }

    @Override
    public List<String> getList() {
        return redisTemplate.opsForHash()
                .keys(ROOM_KEY)
                .stream()
                .map(Object::toString)
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
        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

        Map<String, Object> gameInfo = (Map<String, Object>) roomInfo.get("gameInfo");

        List<Quiz> quizList = (List<Quiz>) gameInfo.get("quizList");

        Quiz quiz = quizList.get(0);
        quizList.remove(0);

        ResponseQuiz response = ResponseQuiz.builder()
                .quiz(quiz.getQuiz())
                .quizCategory(quiz.getQuizCategory().getQuizCategory())
                .remainQuizCount(quizList.size())
                .build();

        gameInfo.put("quizList", quizList);
        roomInfo.put("gameInfo", gameInfo);
        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

        return response;
    }

    @Override
    public void sendMessage(String roomId, RequestSendMessage request) {
        if (roomId == null || roomId.isEmpty()) {
            throw new IllegalArgumentException("유효하지 않은 roomId 입니다.");
        }

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("빈 메세지는 전송할 수 없습니다.");
        }

        Room room = roomRepository.findById(Integer.parseInt(roomId))
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 게임방"));
        User sender = userRepository.findByUserNickname(request.getSender());

        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(room)
                .sender(sender)
                .content(request.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        chatMessageRespository.save(chatMessage);

        if (request.getCorrectAnswer().equals(request.getMessage())) {
            ResponseSendMessage responseMessage = ResponseSendMessage.builder()
                    .roomId(roomId)
                    .sender(sender.getUserNickname())
                    .timestamp(LocalDateTime.now())
                    .content(request.getMessage())
                    .isCorrect(true)
                    .score(10)
                    .build();

            Map<String, Object> roomInfo =
                    (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

            Map<String, Object> gameInfo = (Map<String, Object>) roomInfo.get("gameInfo");
            Map<String, Integer> playerScore = (Map<String, Integer>) gameInfo.get("playerScore");


            int score = playerScore.get(request.getSender());
            score += 10;

            playerScore.put(request.getSender(), score);

            gameInfo.put("playerScore", playerScore);
            roomInfo.put("gameInfo", gameInfo);

            redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

            messagingTemplate
                    .convertAndSend("/topic/catch-mind-messages/" + roomId, responseMessage);

        } else {
            ResponseSendMessage responseMessage = ResponseSendMessage.builder()
                    .roomId(roomId)
                    .sender(sender.getUserNickname())
                    .timestamp(LocalDateTime.now())
                    .content(request.getMessage())
                    .isCorrect(false)
                    .score(-1)
                    .build();

            messagingTemplate
                    .convertAndSend("/topic/catch-mind-messages/" + roomId, responseMessage);
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
}
