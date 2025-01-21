package com.meeple.meeple_back.game.cockroach.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GameRoomService {

    private static final String ROOM_KEY = "GAME_ROOMS";

    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public GameRoomService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void createRoom(String roomId) {
        Map<String, Object> roomInfo = new HashMap<>();
        roomInfo.put("players", new ArrayList<>());
        roomInfo.put("gameData", new HashMap<>());
        System.out.println("createRoom service 호출");
        redisTemplate.opsForHash().put(ROOM_KEY, roomId, roomInfo);
    }

    public Map<String, Object> getRoom(String roomId) {
        System.out.println("getRoom service 호출");
        return (Map<String, Object>) redisTemplate.opsForHash().get(ROOM_KEY, roomId);
    }

    public void updateGameData(String roomId, String key, Object value) {
        Map<String, Object> room = getRoom(roomId);

        if (room != null) {
            Map<String, Object> gameData = (Map<String, Object>) room.get("gameData");
            gameData.put(key, value);
            redisTemplate.opsForHash().put(ROOM_KEY, roomId, room);
        }
    }

    public void addPlayer(String roomId, String playerName) {
        Map<String, Object> room = getRoom(roomId);
        if (room != null) {
            List<String> players = (List<String>) room.get("players");
            players.add(playerName);
            redisTemplate.opsForHash().put(ROOM_KEY, roomId, room);
        }
    }

    public void deleteRoom(String roomId) {
        redisTemplate.opsForHash().delete(ROOM_KEY, roomId);
    }
}
