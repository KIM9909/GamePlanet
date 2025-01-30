package com.meeple.meeple_back.game.catchmind.controller;

import com.meeple.meeple_back.game.catchmind.model.request.*;
import com.meeple.meeple_back.game.catchmind.model.response.*;
import com.meeple.meeple_back.game.catchmind.service.CatchMindService;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catch-mind")
public class CatchMindController {
    private static final String ROOM_KEY = "CATCH_MIND_GAME_ROOMS";
    private final CatchMindService catchMindService;
    private final SimpMessageSendingOperations messagingTemplate;

    @Autowired
    public CatchMindController(CatchMindService catchMindService,
                               SimpMessageSendingOperations messagingTemplate) {
        this.catchMindService = catchMindService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<Map<String, Object>> getRoomDetail(@PathVariable String roomId) {
        try {
            Map<String, Object> roomInfo = catchMindService.getRoomDetail(roomId);
            return ResponseEntity.ok(roomInfo);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create-room")
    public ResponseEntity<ResponseCreateRoom> createRoom(
            @RequestBody RequestCreateRoom request
            ) {
        ResponseCreateRoom response = catchMindService.createRoom(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/join-room")
    public ResponseEntity<ResponseJoinRoom> joinRoom(
            @RequestBody RequestJoinRoom request
            ) {
        ResponseJoinRoom response = catchMindService.joinRoom(request);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @MessageMapping("/update-room/{roomId}")
    public void updateRoom(
            @DestinationVariable String roomId,
            @RequestBody RequestUpdateRoom request
    ) {
        ResponseUpdateRoom response = catchMindService.updateRoom(roomId, request);

        messagingTemplate.convertAndSend("/topic/catch-mind/" + roomId, response);
    }

    @GetMapping
    public ResponseEntity<List<String>> roomList() {
        List<String> response = catchMindService.getList();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete-room")
    public ResponseEntity<String> deleteRoom(@RequestParam String roomId) {
        catchMindService.deleteRoom(roomId);

        return ResponseEntity.ok("Room deleted " + roomId);
    }

    @MessageMapping("/start-game/{roomId}")
    public void startGame(
            @DestinationVariable String roomId
    ) {
        ResponseStartGame response = catchMindService.startGame(roomId);

        messagingTemplate.convertAndSend("/topic/catch-mind/" + roomId, response);
    }

    @MessageMapping("/drawing/{roomId}")
    public void drawing(
            @DestinationVariable String roomId,
            @RequestBody RequestDrawing request
    ) {
        messagingTemplate.convertAndSend("/topic/catch-mind/" + roomId, request);
    }

    @MessageMapping("/request-quiz/{roomId}")
    public void requestQuiz(
            @DestinationVariable String roomId
    ) {
        ResponseQuiz response = catchMindService.requestQuiz(roomId);

        messagingTemplate.convertAndSend("/topic/catch-mind/" + roomId, response);
    }

    @MessageMapping("/chat/{roomId}")
    public void handleMessage(
            @DestinationVariable String roomId,
            @RequestBody RequestSendMessage request
            ) {
        catchMindService.sendMessage(roomId, request);
    }

    @MessageMapping("/game-result/{roomId}")
    public void gameResult(
            @DestinationVariable String roomId
    ) {
        List<ResponseGameResult> response = catchMindService.gameResult(roomId);

        messagingTemplate.convertAndSend("/topic/catch-mind/" + roomId, response);
    }

    @MessageMapping("/send-vote/{roomId}")
    private void sendVote(
            @DestinationVariable String roomId,
            @RequestBody RequestSendVote request
    ) {
        ResponseSendVote response = catchMindService.sendVote(roomId, request);
        messagingTemplate.convertAndSend("/topic/catch-mind/" + roomId, response);
    }

    @MessageMapping("/vote/{roomId}")
    private void vote(
            @DestinationVariable String roomId,
            @RequestBody RequestVote request
    ) {
        ResponseVote response = catchMindService.vote(request);

        messagingTemplate.convertAndSend("/topic/catch-mind/" + roomId, response);
    }

    @MessageMapping("/vote-result/{roomId}")
    private void voteResult(
            @DestinationVariable String roomId,
            @RequestBody RequestVoteResult request
    ) {
        ResponseVoteResult response = catchMindService.voteResult(roomId, request);
        messagingTemplate.convertAndSend("/topic/catch-mind/" + roomId, response);
    }
}
