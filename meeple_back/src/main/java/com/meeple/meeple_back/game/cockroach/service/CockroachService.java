package com.meeple.meeple_back.game.cockroach.service;

import com.meeple.meeple_back.game.cockroach.model.request.RequestCheckCard;
import com.meeple.meeple_back.game.cockroach.model.request.RequestGiveCard;
import com.meeple.meeple_back.game.cockroach.model.request.RequestSendMessage;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseCheckCard;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseGiveCard;
import com.meeple.meeple_back.game.cockroach.model.response.ResponseStartGame;

public interface CockroachService {

    ResponseStartGame startGame(String roomId);

    ResponseGiveCard giveCard(String roomId, RequestGiveCard request);

    ResponseCheckCard checkCard(String roomId, RequestCheckCard request);


    void sendMessage(RequestSendMessage request);
}
