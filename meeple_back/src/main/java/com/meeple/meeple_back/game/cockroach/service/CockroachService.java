package com.meeple.meeple_back.game.cockroach.service;

import com.meeple.meeple_back.game.cockroach.model.request.RequestMultiCard;
import com.meeple.meeple_back.game.cockroach.model.request.RequestSingleCard;
import com.meeple.meeple_back.game.cockroach.model.request.RequestGiveCard;
import com.meeple.meeple_back.game.cockroach.model.request.RequestSendMessage;
import com.meeple.meeple_back.game.cockroach.model.response.*;

public interface CockroachService {

    ResponseStartGame startGame(String roomId);

    ResponseGiveCard giveCard(String roomId, RequestGiveCard request);

    ResponseCheckCard singleCard(String roomId, RequestSingleCard request);

    ResponseMultiCard multiCard(String roomId, RequestMultiCard request);

    void sendMessage(String roomId, RequestSendMessage request);

    ResponseExitRoom exitRoom(String roomId, String userNickname);
}
