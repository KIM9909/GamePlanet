package com.meeple.meeple_back.gameInfo.controller;

import com.meeple.meeple_back.gameInfo.model.request.RequestCreateGameInfo;
import com.meeple.meeple_back.gameInfo.model.response.ResponseCreateGameInfo;
import com.meeple.meeple_back.gameInfo.model.response.ResponseGameInfo;
import com.meeple.meeple_back.gameInfo.model.response.ResponseGameInfoList;
import com.meeple.meeple_back.gameInfo.service.GameInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game-info")
public class GameInfoController {
    private final GameInfoService gameInfoService;

    @Autowired
    public GameInfoController(GameInfoService gameInfoService) {
        this.gameInfoService = gameInfoService;
    }


    @GetMapping
    public ResponseEntity<ResponseGameInfoList> findGameInfoList() {

        ResponseGameInfoList response = gameInfoService.getGameInfoList();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ResponseCreateGameInfo> createGameInfo(
            @RequestBody RequestCreateGameInfo request
            ) {

        ResponseCreateGameInfo response = gameInfoService.createGameInfo(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{gameInfoId}")
    public ResponseEntity<ResponseGameInfo> findGameInfo(
            @PathVariable int gameInfoId
    ) {
        ResponseGameInfo response = gameInfoService.getGameInfo(gameInfoId);

        return ResponseEntity.ok(response);
    }
}

