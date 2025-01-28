package com.meeple.meeple_back.game.catchmind.service;

import com.meeple.meeple_back.game.catchmind.model.request.*;
import com.meeple.meeple_back.game.catchmind.model.response.*;

import java.util.List;

public interface CatchMindService {
    ResponseCreateRoom createRoom(RequestCreateRoom request);

    ResponseJoinRoom joinRoom(RequestJoinRoom request);

    List<String> getList();

    void deleteRoom(String roomId);

    ResponseStartGame startGame(String roomId);

    void sendMessage(String roomId, RequestSendMessage request);

    ResponseQuiz requestQuiz(String roomId);

    ResponseSendVote sendVote(String roomId, RequestSendVote request);

    ResponseVote vote(RequestVote request);

    ResponseVoteResult voteResult(String roomId, RequestVoteResult request);
}
