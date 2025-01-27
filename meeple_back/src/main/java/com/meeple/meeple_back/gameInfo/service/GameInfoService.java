package com.meeple.meeple_back.gameInfo.service;

import com.meeple.meeple_back.gameInfo.model.request.RequestCreateGameInfo;
import com.meeple.meeple_back.gameInfo.model.response.ResponseCreateGameInfo;
import com.meeple.meeple_back.gameInfo.model.response.ResponseGameInfo;
import com.meeple.meeple_back.gameInfo.model.response.ResponseGameInfoList;
import org.springframework.http.ResponseEntity;

public interface GameInfoService {
   ResponseGameInfoList getGameInfoList();

    ResponseCreateGameInfo createGameInfo(RequestCreateGameInfo request);

    ResponseGameInfo getGameInfo(int gameInfoId);
}
