package com.meeple.meeple_back.game.cockroach.service;

import com.meeple.meeple_back.game.cockroach.model.response.ResponseStartGame;

public interface CockroachService {

    ResponseStartGame startGame(String roomId);
}
