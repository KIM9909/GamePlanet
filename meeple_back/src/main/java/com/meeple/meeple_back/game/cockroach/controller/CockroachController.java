package com.meeple.meeple_back.game.cockroach.controller;

import com.meeple.meeple_back.game.cockroach.model.request.RequestCreateRoom;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseCreateRoom;
import com.meeple.meeple_back.game.cockroach.service.CockroachService;
import com.meeple.meeple_back.game.cockroach.service.GameRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class CockroachController {

    private final CockroachService cockroachService;
    private final GameRoomService gameRoomService;

    @Autowired
    public CockroachController(CockroachService cockroachService,
        GameRoomService gameRoomService) {
        this.cockroachService = cockroachService;
        this.gameRoomService = gameRoomService;
    }

    @PostMapping("/create-room")
    public ResponseEntity<ResponseCreateRoom> createRoom(@RequestBody RequestCreateRoom request) {
        System.out.println("방 생성 호출됨");
        ResponseCreateRoom response = gameRoomService.createRoom(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/join-room")
    public ResponseEntity<String> joinRoom(
        @RequestParam String roomId,
        @RequestParam String playerName) {
        gameRoomService.addPlayer(roomId, playerName);
        return ResponseEntity.ok(playerName + "joined room: " + roomId);
    }

    @PostMapping("/update-data")
    public ResponseEntity<String> updateGameData(
        @RequestParam String roomId,
        @RequestParam String key,
        @RequestParam Object value) {
        gameRoomService.updateGameData(roomId, key, value);

        return ResponseEntity.ok("Game data updated for room: " + roomId);
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<Map<String, Object>> getRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(gameRoomService.getRoom(roomId));
    }

    @DeleteMapping("/delete-room")
    public ResponseEntity<String> deleteRoom(@RequestParam String roomId) {
        gameRoomService.deleteRoom(roomId);
        return ResponseEntity.ok("Room deleted: " + roomId);
    }

    @GetMapping("/rooms")
    public List<String> getAllRooms() {
        return gameRoomService.getAllRooms();
    }
}
