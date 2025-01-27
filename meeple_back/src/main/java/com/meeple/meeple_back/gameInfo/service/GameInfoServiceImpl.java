package com.meeple.meeple_back.gameInfo.service;

import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.repo.GameRepository;
import com.meeple.meeple_back.gameInfo.model.entity.GameInfo;
import com.meeple.meeple_back.gameInfo.model.request.RequestCreateGameInfo;
import com.meeple.meeple_back.gameInfo.model.response.ResponseCreateGameInfo;
import com.meeple.meeple_back.gameInfo.model.response.ResponseGameInfo;
import com.meeple.meeple_back.gameInfo.model.response.ResponseGameInfoList;
import com.meeple.meeple_back.gameInfo.repository.GameCommunityCommentRepository;
import com.meeple.meeple_back.gameInfo.repository.GameCommunityRepository;
import com.meeple.meeple_back.gameInfo.repository.GameInfoRepository;
import com.meeple.meeple_back.gameInfo.repository.GameReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameInfoServiceImpl implements GameInfoService{

    private final GameCommunityRepository gameCommunityRepository;
    private final GameInfoRepository gameInfoRepository;
    private final GameReviewRepository gameReviewRepository;
    private final GameCommunityCommentRepository gameCommunityCommentRepository;
    private final GameRepository gameRepository;

    @Autowired
    public GameInfoServiceImpl(GameCommunityRepository gameCommunityRepository,
                               GameInfoRepository gameInfoRepository,
                               GameReviewRepository gameReviewRepository,
                               GameCommunityCommentRepository gameCommunityCommentRepository,
                               GameRepository gameRepository
    ) {
        this.gameCommunityRepository = gameCommunityRepository;
        this.gameInfoRepository = gameInfoRepository;
        this.gameReviewRepository = gameReviewRepository;
        this.gameCommunityCommentRepository = gameCommunityCommentRepository;
        this.gameRepository = gameRepository;
    }

    @Override
    public ResponseGameInfoList getGameInfoList() {
        List<GameInfo> gameInfoList = gameInfoRepository.findAll();

        ResponseGameInfoList response = ResponseGameInfoList.builder()
                .gameInfoList(gameInfoList)
                .build();

        return response;
    }

    @Override
    public ResponseCreateGameInfo createGameInfo(RequestCreateGameInfo request) {
        Game game = gameRepository.findById(request.getGameId()).get();

        GameInfo gameInfo = GameInfo.builder()
                .gameInfoContent(request.getGameInfoContent())
                .gameRule(request.getGameRule())
                .game(game)
                .build();

        GameInfo createdGameInfo = gameInfoRepository.save(gameInfo);

        ResponseCreateGameInfo response = ResponseCreateGameInfo.builder()
                .gameInfoId(createdGameInfo.getGameInfoId())
                .game(createdGameInfo.getGame())
                .build();

        return response;
    }

    @Override
    public ResponseGameInfo getGameInfo(int gameInfoId) {
        GameInfo gameInfo = gameInfoRepository.findById(gameInfoId).get();

        ResponseGameInfo response = ResponseGameInfo.builder()
                .gameInfoContent(gameInfo.getGameInfoContent())
                .gameRule(gameInfo.getGameRule())
                .game(gameInfo.getGame())
                .build();

        return response;
    }
}
