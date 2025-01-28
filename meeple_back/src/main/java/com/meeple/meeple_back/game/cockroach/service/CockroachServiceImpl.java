package com.meeple.meeple_back.game.cockroach.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meeple.meeple_back.game.cockroach.model.entity.Card;
import com.meeple.meeple_back.game.cockroach.model.entity.ChatMessage;
import com.meeple.meeple_back.game.cockroach.model.entity.Room;
import com.meeple.meeple_back.game.cockroach.model.request.*;
import com.meeple.meeple_back.game.cockroach.model.response.*;
import com.meeple.meeple_back.game.cockroach.repository.ChatMessageRespository;
import com.meeple.meeple_back.game.cockroach.repository.RoomRepository;
import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.game.model.GameResult;
import com.meeple.meeple_back.game.repo.GameRepository;
import com.meeple.meeple_back.game.repo.GameResultRepository;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CockroachServiceImpl implements CockroachService {

    private static final String ROOM_KEY = "GAME_ROOMS";
    private static final String[] CARD_TYPES = {"Bat", "Rat", "Fly",
            "Cockroach", "Scorpion", "Toad", "Stinkbug"};

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomRepository roomRepository;
    private final ChatMessageRespository chatMessageRespository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final GameResultRepository gameResultRepository;

    @Autowired
    public CockroachServiceImpl(RedisTemplate<String, Object> redisTemplate,
                                SimpMessageSendingOperations messagingTemplate, RoomRepository roomRepository,
                                ChatMessageRespository chatMessageRespository, UserRepository userRepository,
                                GameRepository gameRepository, GameResultRepository gameResultRepository) {
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
        this.roomRepository = roomRepository;
        this.chatMessageRespository = chatMessageRespository;
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
        this.gameResultRepository = gameResultRepository;
    }

    @Override
    @Transactional
    public void sendMessage(String roomId, RequestSendMessage request) {
        Optional<Room> room = roomRepository.findById(Integer.parseInt(roomId));
        User sender = userRepository.findByUserNickname(request.getSender());

        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(room.get())
                .sender(sender)
                .content(request.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        chatMessageRespository.save(chatMessage);

        ResponseMessage responseMessage = ResponseMessage.builder()
                .roomId(String.valueOf(room.get().getRoomId()))
                .sender(sender.getUserNickname())
                .timestamp(LocalDateTime.now())
                .content(request.getMessage())
                .build();

        messagingTemplate
                .convertAndSend("/topic/messages/" + roomId, responseMessage);
    }

    @Override
    public ResponseStartGame startGame(String roomId) {
        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

        ObjectMapper mapper = new ObjectMapper();
        try {
            String json = mapper.writeValueAsString(roomInfo);
            System.out.println(json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        if (roomInfo == null) {
            throw new IllegalArgumentException("방을 찾을 수 없습니다 : {}" + roomId);
        }

        Map<String, Object> gameData = (Map<String, Object>) roomInfo.get("gameData");

        List<String> players = (List<String>) roomInfo.get("players");

        try {
            String json = mapper.writeValueAsString(players);
            System.out.println(json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }


        /* 카드 분배 */
        List<Card> deck = initializeDeck();

        List<Card> publicDeck = new ArrayList<>();

        publicDeck.addAll(deck.subList(0, 7));
        deck = deck.subList(7, deck.size());

        deck.add(new Card("Joker", false));
        deck.add(new Card("black", false));

        Collections.shuffle(deck);

        Map<String, List<Card>> distributedCards = distributeCards(deck, players);

        Map<String, List<Card>> userTableCards = new HashMap<>();
        for (String player : players) {
            userTableCards.put(player, new ArrayList<>());
        }


        /* redis 저장 */
        gameData.put("publicDeck", publicDeck);
        gameData.put("playerCards", distributedCards);
        gameData.put("userTableCards", userTableCards);
        gameData.put("isGameStart", true);
        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

        /* 데이터 반환 */
        ResponseStartGame response = new ResponseStartGame();
        response.setPlayers(players);
        response.setGameData(gameData);

        return response;
    }

    @Override
    public ResponseGiveCard giveCard(String roomId, RequestGiveCard request) {
        // Redis에서 방 정보 가져오기
        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

        if (roomInfo == null) {
            throw new IllegalArgumentException("방을 찾을 수 없습니다: " + roomId);
        }

        // 플레이어 카드 데이터 가져오기
        Map<String, List<Card>> playerCards = (Map<String, List<Card>>) roomInfo.get("playerCards");
        if (playerCards == null || !playerCards.containsKey(request.getFrom())) {
            throw new IllegalStateException("플레이어 카드 정보를 찾을 수 없습니다: " + request.getFrom());
        }

        List<Card> cards = playerCards.get(request.getFrom());

        boolean cardRemoved = false;
        for (int i = 0; i < cards.size(); i++) {
            if (cards.get(i).getType().equals(request.getCard().getType())) {
                cards.remove(i);
                cardRemoved = true;
                break;
            }
        }

        if (!cardRemoved) {
            throw new IllegalStateException("전달하려는 카드가 플레이어의 패에 없습니다: "
                    + request.getCard());
        }

        // 업데이트된 카드 리스트를 playerCards에 반영
        playerCards.put(request.getFrom(), cards);
        roomInfo.put("playerCards", playerCards);

        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

        ResponseGiveCard response = ResponseGiveCard.builder()
                .to(request.getTo())
                .from(request.getFrom())
                .card(request.getCard())
                .animal(request.getAnimal())
                .isNagative(request.isNagative())
                .isKing(request.isKing())
                .build();

        return response;
    }

    @Override
    public ResponseCheckCard singleCard(String roomId, RequestSingleCard request) {
        /* 방 목록 조회 */
        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

        if (roomInfo == null) {
            throw new IllegalArgumentException("방을 찾을 수 없습니다: " + roomId);
        }

        Map<String, List<Card>> playerTables = (Map<String, List<Card>>) roomInfo.get(
                "userTableCards");
        if (playerTables == null || !playerTables.containsKey(request.getFrom())) {
            throw new IllegalStateException("플레이어 테이블 정보를 찾을 수 없습니다: "
                    + request.getFrom());
        }

        /* 만약 정답을 맞췄다면 */
        ResponseCheckCard response = ResponseCheckCard.builder()
                .userName(request.getFrom())
                .isEnd(false)
                .build();

        List<Card> giveCards = new ArrayList<>();
        List<Card> publicDeck = (List<Card>) roomInfo.get("publicDeck");

        if (request.isCorrect()) {
            List<Card> table = playerTables.get(request.getFrom());

            table.add(request.getCard());
            giveCards.add(request.getCard());

            if (request.getCard().isRoyal()) {
                Card card = publicDeck.get(publicDeck.size() - 1);
                publicDeck.remove(publicDeck.size() - 1);

                table.add(card);
                giveCards.add(card);
            }

            playerTables.put(request.getFrom(), table);
            String loser = checkGameFinish(request.getFrom(), roomInfo);

            if (!loser.equals("")) {
                response.setEnd(true);
                response.setLoser(loser);
            }

        } else {
            List<Card> table = playerTables.get(request.getTo());

            table.add(request.getCard());
            giveCards.add(request.getCard());

            if (request.getCard().isRoyal()) {
                Card card = publicDeck.get(publicDeck.size() - 1);
                publicDeck.remove(publicDeck.size() - 1);

                table.add(card);
                giveCards.add(card);
            }

            playerTables.put(request.getTo(), table);

            response.setUserName(request.getTo());
            String loser = checkGameFinish(request.getTo(), roomInfo);

            if (!loser.equals("")) {
                response.setEnd(true);
                response.setLoser(loser);
            }
        }

        /* Redis 업데이트 */
        roomInfo.put("publicDeck", publicDeck);
        roomInfo.put("playerTableCards", playerTables);
        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

        return response;
    }

    @Override
    public ResponseMultiCard multiCard(String roomId, RequestMultiCard request) {
        /* 방 목록 조회 */
        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

        Map<String, List<Card>> playerCards = (Map<String, List<Card>>) roomInfo.get("playerCards");
        Map<String, List<Card>> userTables =
                (Map<String, List<Card>>) roomInfo.get("userTableCards");

        List<Card> cards = playerCards.get(request.getUser());
        List<Card> tables = userTables.get(request.getUser());

        if (request.isBlack()) {
            for (Card card : request.getCards()) {
                for (int j = 0; j < cards.size(); j++) {
                    if (cards.get(j) == card) {
                        cards.remove(j);
                        tables.add(card);
                        cards.add(new Card("Black", false));
                        break;
                    }
                }
            }
        } else {
            for (Card card : request.getCards()) {
                for (int j = 0; j < cards.size(); j++) {
                    if (cards.get(j) == card) {
                        cards.remove(j);
                        tables.add(card);
                        cards.add(new Card("Joker", false));
                        break;
                    }
                }
            }
        }
        playerCards.put(request.getUser(), cards);
        userTables.put(request.getUser(), tables);
        roomInfo.put("playerCards", playerCards);
        roomInfo.put("userTableCards", userTables);

        List<String> players = (List<String>) roomInfo.get("players");

        String loser = checkGameFinish(request.getUser(), roomInfo);


        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

        ResponseMultiCard response = ResponseMultiCard.builder()
                .gameData(roomInfo)
                .players(players)
                .build();

        if (!loser.equals("")) {
            response.setEnd(true);
            response.setLoser(loser);
        }

        return response;
    }

    @Override
    public ResponseExitRoom exitRoom(String roomId, String userNickname) {
        Map<String, Object> roomInfo =
                (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);

        List<String> userList = (List<String>) roomInfo.get("players");

        if (!userNickname.equals(roomInfo.get("creator"))) {
            for (int i = 0; i < userList.size(); i++) {
                String user = userList.get(i);
                if (user.equals(userNickname)) {
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
                if (userList.get(i).equals(userNickname)) {
                    roomInfo.remove(i);
                    break;
                }
            }
        }

        roomInfo.put("player", userList);

        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

        ResponseExitRoom response = ResponseExitRoom.builder()
                .players(userList)
                .build();

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
    public ResponseHandCheck handCheck(String roomId, RequestHandCheck request) {
        Map<String, Object> roomInfo = (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);
        List<String> players = (List<String>) roomInfo.get("players");

        Game game = gameRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 게임"));

        for (String player : players) {
            User user = userRepository.findByUserNickname(player);

            if (player.equals(request.getPlayer())) {
                GameResult gameResult = GameResult.builder()
                        .game(game)
                        .user(user)
                        .isWinner('N')
                        .build();
                gameResultRepository.save(gameResult);

            } else {
                GameResult gameResult = GameResult.builder()
                        .game(game)
                        .user(user)
                        .isWinner('N')
                        .build();
                gameResultRepository.save(gameResult);
            }
        }
        ResponseHandCheck response = ResponseHandCheck.builder()
                .isEnd(true)
                .loser(request.getPlayer())
                .build();

        return response;
    }

    /* 카드 초기 설정 */
    private static List<Card> initializeDeck() {
        List<Card> deck = new ArrayList<>();

        for (String type : CARD_TYPES) {
            for (int i = 0; i < 7; i++) {
                deck.add(new Card(type, false));
            }
            deck.add(new Card(type, true));
        }

        Collections.shuffle(deck);
        return deck;
    }

    private Map<String, List<Card>> distributeCards(List<Card> deck, List<String> players) {
        Map<String, List<Card>> playerCards = new HashMap<>();
        int playerCount = players.size();
        int cardsPerPlayer = deck.size() / playerCount;
        int remainingCards = deck.size() % playerCount; // 나머지 카드 수

        // 1. 기본 카드 분배
        for (int i = 0; i < players.size(); i++) {
            playerCards.put(players.get(i),
                    new ArrayList<>(deck.subList(i * cardsPerPlayer, (i + 1) * cardsPerPlayer)));
        }

        // 2. 나머지 카드 처리
        int cardIndex = cardsPerPlayer * playerCount;
        for (int i = 0; i < remainingCards; i++) {
            playerCards.get(players.get(i)).add(deck.get(cardIndex + i)); // 앞쪽 플레이어부터 한 장씩 추가
        }

        return playerCards;
    }

    public String checkGameFinish(String userName, Map<String, Object> roomInfo) {
        // 같은 카드가 4장이거나 각 카드별로 1장
        Map<String, List<Card>> userTableCards =
                (Map<String, List<Card>>) roomInfo.get("userTableCards");

        boolean isFinished = false;

        List<Card> userTable = userTableCards.get(userName);
        Map<String, Integer> cardCount = new HashMap<>();
        for (Card card : userTable) {
            cardCount.put(card.getType(), cardCount.getOrDefault(card.getType(), 0) + 1);

            if (cardCount.get(card.getType()) >= 4) {
                isFinished = true;
                break;
            }
        }

        Set<String> allCardTypes = new HashSet<>(List.of(CARD_TYPES));
        Set<String> playerCardTypes = new HashSet<>();

        for (Card card : userTable) {
            playerCardTypes.add(card.getType());
        }

        if (playerCardTypes.containsAll(allCardTypes)) {
            isFinished = true;
        }

        if (isFinished) {
            List<String> users = (List<String>) roomInfo.get("players");

            Optional<Game> game = gameRepository.findById(1);
            for (String user : users) {
                if (!user.equals(userName)) {
                    User winner = userRepository.findByUserNickname(user);
                    GameResult gameResult = GameResult.builder()
                            .game(game.get())
                            .isWinner('Y')
                            .user(winner)
                            .build();

                    gameResultRepository.save(gameResult);
                } else {
                    User winner = userRepository.findByUserNickname(user);
                    GameResult gameResult = GameResult.builder()
                            .game(game.get())
                            .isWinner('N')
                            .user(winner)
                            .build();

                    gameResultRepository.save(gameResult);
                }
            }

            return userName;
        } else {
            return "";
        }
    }
}
