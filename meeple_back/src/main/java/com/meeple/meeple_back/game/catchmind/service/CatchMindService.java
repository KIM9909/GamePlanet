package com.meeple.meeple_back.game.catchmind.service;

import com.meeple.meeple_back.game.catchmind.model.request.RequestJoinRoom;
import com.meeple.meeple_back.game.catchmind.model.request.RequestSendMessage;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseCreateRoom;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseJoinRoom;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseQuiz;
import com.meeple.meeple_back.game.catchmind.model.response.ResponseStartGame;
import com.meeple.meeple_back.game.cockroach.model.request.RequestCreateRoom;

import java.util.List;

public interface CatchMindService {
    ResponseCreateRoom createRoom(RequestCreateRoom request);

    ResponseJoinRoom joinRoom(RequestJoinRoom request);

    List<String> getList();

    void deleteRoom(String roomId);

    ResponseStartGame startGame(String roomId);

    void sendMessage(String roomId, RequestSendMessage request);

    ResponseQuiz requestQuiz(String roomId);
}
