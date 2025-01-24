package com.meeple.meeple_back.game.cockroach.service;

import com.meeple.meeple_back.game.cockroach.model.entity.Room;
import com.meeple.meeple_back.game.cockroach.repository.RoomRepository;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GameRoomService {

    private static final String ROOM_KEY = "GAME_ROOMS";

    private final RedisTemplate<String, Object> redisTemplate;
    private final RoomRepository roomRepository;

    @Autowired
    public GameRoomService(RedisTemplate<String, Object> redisTemplate,
                           RoomRepository roomRepository) {
        this.redisTemplate = redisTemplate;
        this.roomRepository = roomRepository;
    }

    public int createRoom(String roomId) {
        Map<String, Object> roomInfo = new HashMap<>();
        List<String> players = new ArrayList<>();
        players.add("user1");
        players.add("user2");
        players.add("user3");
//        roomInfo.put("players", new ArrayList<>());
        roomInfo.put("players", players);
        roomInfo.put("gameData", new HashMap<>());
        System.out.println("createRoom service 호출");

        Room room = Room.builder()
                .roomName(roomId)
                .createTime(LocalDateTime.now())
                .build();

        Room savedRoom = roomRepository.save(room);


        redisTemplate.opsForHash().put(ROOM_KEY, savedRoom.getRoomId() + "", roomInfo);

        return savedRoom.getRoomId();
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
        System.out.println(roomId + "방 " + playerName + " 유저 참가 서비스" );
        if (room != null) {
            List<String> players = (List<String>) room.get("players");
            players.add(playerName);
            redisTemplate.opsForHash().put(ROOM_KEY, roomId, room);
        }
    }

    public void deleteRoom(String roomId) {
        redisTemplate.opsForHash().delete(ROOM_KEY, roomId);
    }

    public List<String> getAllRooms() {
        System.out.println("getAllRooms service 호출");

        // Redis에서 Object 타입 키를 가져와 String으로 변환
        return redisTemplate.opsForHash()
                .keys(ROOM_KEY)
                .stream()
                .map(Object::toString) // Object 타입을 String으로 변환
                .collect(Collectors.toList());
    }
}
