package com.meeple.meeple_back.gameInfo.service;

import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.repo.GameRepository;
import com.meeple.meeple_back.gameInfo.model.entity.GameCommunity;
import com.meeple.meeple_back.gameInfo.model.entity.GameInfo;
import com.meeple.meeple_back.gameInfo.model.entity.GameReview;
import com.meeple.meeple_back.gameInfo.model.request.commnity.RequestCreateCommunity;
import com.meeple.meeple_back.gameInfo.model.request.gameReview.RequestUpdateReview;
import com.meeple.meeple_back.gameInfo.model.response.community.ResponseCommunityList;
import com.meeple.meeple_back.gameInfo.model.response.community.ResponseCreateCommunity;
import com.meeple.meeple_back.gameInfo.model.response.gameReview.ResponseCreateReview;
import com.meeple.meeple_back.gameInfo.model.request.gameInfo.RequestCreateGameInfo;
import com.meeple.meeple_back.gameInfo.model.request.gameReview.RequestCreateReview;
import com.meeple.meeple_back.gameInfo.model.request.gameInfo.RequestUpdateGameInfo;
import com.meeple.meeple_back.gameInfo.model.response.gameInfo.*;
import com.meeple.meeple_back.gameInfo.model.response.gameReview.ResponseReviewList;
import com.meeple.meeple_back.gameInfo.model.response.gameReview.ResponseUpdateReview;
import com.meeple.meeple_back.gameInfo.repository.GameCommunityCommentRepository;
import com.meeple.meeple_back.gameInfo.repository.GameCommunityRepository;
import com.meeple.meeple_back.gameInfo.repository.GameInfoRepository;
import com.meeple.meeple_back.gameInfo.repository.GameReviewRepository;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class GameInfoServiceImpl implements GameInfoService{

    private final GameCommunityRepository gameCommunityRepository;
    private final GameInfoRepository gameInfoRepository;
    private final GameReviewRepository gameReviewRepository;
    private final GameCommunityCommentRepository gameCommunityCommentRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final ModelMapper mapper;



    @Override
    public ResponseGameInfoList getGameInfoList() {
        List<GameInfo> gameInfoList = gameInfoRepository.findAll();

        ResponseGameInfoList response = ResponseGameInfoList.builder()
                .gameInfoList(gameInfoList)
                .build();

        return response;
    }

    @Override
    @Transactional
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

    @Override
    @Transactional
    public ResponseUpdateGameInfo updateGameInfo(int gameInfoId, RequestUpdateGameInfo request) {
        GameInfo gameInfo = gameInfoRepository.findById(gameInfoId)
                .orElseThrow(() -> new EntityNotFoundException("게임 정보를 찾을 수 없습니다."));

        if (request.getGameInfoContent() != null) {
            gameInfo.setGameInfoContent(request.getGameInfoContent());
        }

        if (request.getGameRule() != null) {
            gameInfo.setGameRule(request.getGameRule());
        }

        gameInfoRepository.save(gameInfo);

        return new ResponseUpdateGameInfo(200, gameInfoId + "번 게임 정보 업데이트 성공");
    }

    @Override
    public ResponseDeleteGameInfo deleteGameInfo(int gameInfoId) {
        GameInfo gameInfo = gameInfoRepository.findById(gameInfoId)
                .orElseThrow(() -> new EntityNotFoundException("게임 정보를 찾을 수 없습니다."));

        try {
            gameInfoRepository.delete(gameInfo);

            ResponseDeleteGameInfo response = ResponseDeleteGameInfo
                    .builder()
                    .code(200)
                    .message("삭제 성공")
                    .build();

            return response;
        } catch (Exception e) {
            ResponseDeleteGameInfo response = ResponseDeleteGameInfo.builder()
                    .code(500)
                    .message("삭제 실패")
                    .build();
            return response;
        }
    }

    @Override
    public ResponseCreateReview createReview(RequestCreateReview request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 유저입니다."));

        GameInfo gameInfo = gameInfoRepository.findById(request.getGameInfoId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 게임 정보입니다."));

        GameReview gameReview = GameReview.builder()
                .gameReviewContent(request.getGameReviewContent())
                .gameReviewStar(request.getGameReviewStar())
                .gameInfo(gameInfo)
                .user(user)
                .build();

        GameReview savedReview = gameReviewRepository.save(gameReview);

        ResponseCreateReview response = ResponseCreateReview.builder()
                .reviewId(savedReview.getGameReviewId())
                .user(user)
                .gameInfo(gameInfo)
                .build();

        return response;
    }

    @Override
    public ResponseReviewList getReviewList(int gameInfoId) {
        List<GameReview> gameReviews = gameReviewRepository.findByGameInfo_GameInfoId(gameInfoId);

        double averageStar = gameReviews.stream()
                .mapToInt(GameReview::getGameReviewStar)
                .average()
                .orElse(0.0);


        ResponseReviewList response = ResponseReviewList.builder()
                .reviewList(gameReviews)
                .starAvg(averageStar)
                .build();

        return response;
    }

    @Override
    public void deleteReview(int reviewId) {
        GameReview gameReview = gameReviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 리뷰입니다"));

        gameReviewRepository.delete(gameReview);
    }

    @Override
    public ResponseUpdateReview updateReview(int reviewId, RequestUpdateReview request) {
        GameReview gameReview = gameReviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 리뷰입니다"));

        if (!request.getGameReviewContent().equals(gameReview.getGameReviewContent())) {
            gameReview.setGameReviewContent(request.getGameReviewContent());
        }

        if (request.getGameReviewStar() != gameReview.getGameReviewStar()) {
            gameReview.setGameReviewStar(request.getGameReviewStar());
        }

        GameReview savedGameReview = gameReviewRepository.save(gameReview);

        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        return mapper.map(savedGameReview, ResponseUpdateReview.class);
    }

    @Override
    public ResponseCreateCommunity createCommunity(RequestCreateCommunity request) {
        GameCommunity gameCommunity = new GameCommunity();

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 회원"));

        GameInfo gameInfo = gameInfoRepository.findById(request.getGameInfoId())
                        .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 게임 정보"));

        gameCommunity.setUser(user);
        gameCommunity.setGameInfo(gameInfo);
        gameCommunity.setCreateAt(Date.valueOf(LocalDate.now()));
        gameCommunity.setGameCommunityContent(request.getGameCommunityContent());

        GameCommunity savedCommunity = gameCommunityRepository.save(gameCommunity);

        ResponseCreateCommunity response = ResponseCreateCommunity.builder()
                .gameCommunityId(savedCommunity.getGameCommunityId())
                .createAt(savedCommunity.getCreateAt())
                .user(savedCommunity.getUser())
                .gameInfo(savedCommunity.getGameInfo())
                .build();

        return response;
    }

    @Override
    public List<ResponseCommunityList> getCommunityList(int gameInfoId) {
        List<GameCommunity> gameCommunityList = gameCommunityRepository.findByGameInfo_GameInfoId(gameInfoId);


        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        return gameCommunityList.stream().map(gameCommunity -> mapper
                .map(gameCommunity, ResponseCommunityList.class))
                .collect(Collectors.toList());
    }
}
