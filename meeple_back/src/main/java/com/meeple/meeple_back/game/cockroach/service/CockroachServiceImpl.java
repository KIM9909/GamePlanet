package com.meeple.meeple_back.game.cockroach.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meeple.meeple_back.game.cockroach.model.entity.Card;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseStartGame;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class CockroachServiceImpl implements CockroachService {

    private static final String ROOM_KEY = "GAME_ROOMS";
    private static final String[] CARD_TYPES = {"Bat", "Rat", "Fly",
        "Cockroach", "Scorpion", "Toad", "Stinkbug"};

    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public CockroachServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
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

        /* redis 저장 */
        gameData.put("publicDeck", publicDeck);
        gameData.put("playerCards", distributedCards);
        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);

        /* 데이터 반환 */
        ResponseStartGame response = new ResponseStartGame();
        response.setPlayers(players);
        response.setGameData(gameData);

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
}
