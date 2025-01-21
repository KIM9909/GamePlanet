package com.meeple.meeple_back.game.cockroach.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class WebSocketController {

    @MessageMapping("/chat")
    @SendTo("/topic.messages")
    public String handleMessage(String message) {
        return message;
    }

    @MessageMapping("/game")
    @SendTo("/topic/game")
    public Map<String, Object> handleGameEvent(Map<String, Object> gameEvent) {
        return gameEvent;
    }
}
