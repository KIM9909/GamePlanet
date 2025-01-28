package com.meeple.meeple_back.game.catchmind.controller;

import com.meeple.meeple_back.game.catchmind.model.request.RequestJoinRoom;
import com.meeple.meeple_back.game.catchmind.model.request.RequestSendMessage;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseCreateRoom;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseJoinRoom;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseQuiz;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseStartGame;
import com.meeple.meeple_back.game.catchmind.service.CatchMindService;
import com.meeple.meeple_back.game.cockroach.model.request.RequestCreateRoom;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catch-mind")
public class CatchMindController {
    private final CatchMindService catchMindService;
    private final SimpMessageSendingOperations messagingTemplate;

    @Autowired
    public CatchMindController(CatchMindService catchMindService,
                               SimpMessageSendingOperations messagingTemplate) {
        this.catchMindService = catchMindService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/create-room")
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
}
