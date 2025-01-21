package com.meeple.meeple_back.game.cockroach.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class WebSocketController {

    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/messages/{roomId}")
    public String handleMessage(@DestinationVariable String roomId, String message) {
        System.out.println(message);
        return message;
    }

    @MessageMapping("/game/{roomId}")
    @SendTo("/topic/game/{roomId}")
    public Map<String, Object> handleGameEvent(Map<String, Object> gameEvent) {
        return gameEvent;
    }
}
