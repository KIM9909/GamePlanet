package com.meeple.meeple_back.gameInfo.service;

import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.repo.GameRepository;
import com.meeple.meeple_back.gameInfo.dto.SimpleUserDTO;
import com.meeple.meeple_back.gameInfo.model.entity.GameCommunity;
import com.meeple.meeple_back.gameInfo.model.entity.GameCommunityComment;
import com.meeple.meeple_back.gameInfo.model.entity.GameInfo;
import com.meeple.meeple_back.gameInfo.model.entity.GameReview;
import com.meeple.meeple_back.gameInfo.model.request.commnity.RequestCreateComment;
import com.meeple.meeple_back.gameInfo.model.request.commnity.RequestCreateCommunity;
import com.meeple.meeple_back.gameInfo.model.request.commnity.RequestUpdateComment;
import com.meeple.meeple_back.gameInfo.model.request.commnity.RequestUpdateCommunity;
import com.meeple.meeple_back.gameInfo.model.request.gameInfo.RequestCreateGameInfo;
import com.meeple.meeple_back.gameInfo.model.request.gameInfo.RequestUpdateGameInfo;
import com.meeple.meeple_back.gameInfo.model.request.gameReview.RequestCreateReview;
import com.meeple.meeple_back.gameInfo.model.request.gameReview.RequestUpdateReview;
import com.meeple.meeple_back.gameInfo.model.response.community.ResponseCommunity;
import com.meeple.meeple_back.gameInfo.model.response.community.ResponseCommunityList;
import com.meeple.meeple_back.gameInfo.model.response.community.ResponseCreateComment;
import com.meeple.meeple_back.gameInfo.model.response.community.ResponseCreateCommunity;
import com.meeple.meeple_back.gameInfo.model.response.community.ResponseDeleteCommunity;
import com.meeple.meeple_back.gameInfo.model.response.community.ResponseDeleteComment;
import com.meeple.meeple_back.gameInfo.model.response.community.ResponseUpdateComment;
import com.meeple.meeple_back.gameInfo.model.response.community.ResponseUpdateCommunity;
import com.meeple.meeple_back.gameInfo.model.response.gameInfo.*;
import com.meeple.meeple_back.gameInfo.model.response.gameReview.ResponseCreateReview;
import com.meeple.meeple_back.gameInfo.model.response.gameReview.ResponseReviewList;
import com.meeple.meeple_back.gameInfo.model.response.gameReview.ResponseUpdateReview;
import com.meeple.meeple_back.gameInfo.service.GameInfoServiceImpl;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GameInfoServiceTest {

    @Mock
    private com.meeple.meeple_back.gameInfo.repository.GameCommunityRepository gameCommunityRepository;

    @Mock
    private com.meeple.meeple_back.gameInfo.repository.GameInfoRepository gameInfoRepository;

    @Mock
    private com.meeple.meeple_back.gameInfo.repository.GameReviewRepository gameReviewRepository;

    @Mock
    private com.meeple.meeple_back.gameInfo.repository.GameCommunityCommentRepository gameCommunityCommentRepository;

    @Mock
    private GameRepository gameRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private ModelMapper mapper = new ModelMapper();

    @InjectMocks
    private GameInfoServiceImpl gameInfoService;

    @BeforeEach
    public void setUp() {
        // ModelMapper 설정 (STRICT 매칭)
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
    }

    @Test
    public void testGetGameInfoList() {
        GameInfo info1 = new GameInfo();
        info1.setGameInfoId(1);
        GameInfo info2 = new GameInfo();
        info2.setGameInfoId(2);
        List<GameInfo> gameInfoList = Arrays.asList(info1, info2);
        when(gameInfoRepository.findAll()).thenReturn(gameInfoList);

        ResponseGameInfoList response = gameInfoService.getGameInfoList();
        assertNotNull(response);
        assertEquals(gameInfoList, response.getGameInfoList());
    }

    @Test
    public void testCreateGameInfo() {
        RequestCreateGameInfo request = new RequestCreateGameInfo();
        request.setGameId(10);
        request.setGameInfoContent("Test Content");
        request.setGameRule("Test Rule");

        Game game = new Game();
        game.setGameId(10);
        when(gameRepository.findById(10)).thenReturn(Optional.of(game));

        GameInfo savedInfo = new GameInfo();
        savedInfo.setGameInfoId(1);
        savedInfo.setGame(game);
        when(gameInfoRepository.save(any(GameInfo.class))).thenReturn(savedInfo);

        ResponseCreateGameInfo response = gameInfoService.createGameInfo(request);
        assertNotNull(response);
        assertEquals(1, response.getGameInfoId());
        assertEquals(game, response.getGame());
    }

    @Test
    public void testGetGameInfo() {
        int gameInfoId = 1;
        GameInfo gameInfo = new GameInfo();
        gameInfo.setGameInfoId(gameInfoId);
        gameInfo.setGameInfoContent("Content");
        gameInfo.setGameRule("Rule");
        gameInfo.setGameInfoFile("fileUrl");
        Game game = new Game();
        gameInfo.setGame(game);

        when(gameInfoRepository.findById(gameInfoId)).thenReturn(Optional.of(gameInfo));

        ResponseGameInfo response = gameInfoService.getGameInfo(gameInfoId);
        assertNotNull(response);
        assertEquals(gameInfoId, response.getGameInfoId());
        assertEquals("Content", response.getGameInfoContent());
        assertEquals("Rule", response.getGameRule());
        assertEquals("fileUrl", response.getGameInfoFile());
        assertEquals(game, response.getGame());
    }

    @Test
    public void testUpdateGameInfo() {
        int gameInfoId = 1;
        GameInfo gameInfo = new GameInfo();
        gameInfo.setGameInfoId(gameInfoId);
        gameInfo.setGameInfoContent("Old Content");
        gameInfo.setGameRule("Old Rule");

        when(gameInfoRepository.findById(gameInfoId)).thenReturn(Optional.of(gameInfo));

        RequestUpdateGameInfo request = new RequestUpdateGameInfo();
        request.setGameInfoContent("New Content");
        request.setGameRule("New Rule");

        ResponseUpdateGameInfo response = gameInfoService.updateGameInfo(gameInfoId, request);
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertTrue(response.getMessage().contains("업데이트 성공"));
        assertEquals("New Content", gameInfo.getGameInfoContent());
        assertEquals("New Rule", gameInfo.getGameRule());
        verify(gameInfoRepository).save(gameInfo);
    }

    @Test
    public void testDeleteGameInfo_Success() {
        int gameInfoId = 1;
        GameInfo gameInfo = new GameInfo();
        gameInfo.setGameInfoId(gameInfoId);
        when(gameInfoRepository.findById(gameInfoId)).thenReturn(Optional.of(gameInfo));
        doNothing().when(gameInfoRepository).delete(gameInfo);

        ResponseDeleteGameInfo response = gameInfoService.deleteGameInfo(gameInfoId);
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("삭제 성공", response.getMessage());
    }

    @Test
    public void testDeleteGameInfo_Failure() {
        int gameInfoId = 1;
        GameInfo gameInfo = new GameInfo();
        gameInfo.setGameInfoId(gameInfoId);
        when(gameInfoRepository.findById(gameInfoId)).thenReturn(Optional.of(gameInfo));
        doThrow(new RuntimeException("Error")).when(gameInfoRepository).delete(gameInfo);

        ResponseDeleteGameInfo response = gameInfoService.deleteGameInfo(gameInfoId);
        assertNotNull(response);
        assertEquals(500, response.getCode());
        assertEquals("삭제 실패", response.getMessage());
    }

    @Test
    public void testCreateReview_Success() {
        RequestCreateReview request = new RequestCreateReview();
        request.setUserId(1);
        request.setGameInfoId(2);
        request.setGameReviewContent("Great game!");
        request.setGameReviewStar(5);

        User user = new User();
        user.setUserId(1L);
        GameInfo gameInfo = new GameInfo();
        gameInfo.setGameInfoId(2);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(gameInfoRepository.findById(2)).thenReturn(Optional.of(gameInfo));
        when(gameReviewRepository.existsByUser_UserId(1)).thenReturn(false);

        GameReview review = new GameReview();
        review.setGameReviewId(100);
        review.setUser(user);
        review.setGameInfo(gameInfo);
        when(gameReviewRepository.save(any(GameReview.class))).thenReturn(review);

        ResponseCreateReview response = gameInfoService.createReview(request);
        assertNotNull(response);
        assertEquals(100, response.getReviewId());
        assertEquals(user, response.getUser());
        assertEquals(gameInfo, response.getGameInfo());
    }

    @Test
    public void testCreateReview_AlreadyExists() {
        RequestCreateReview request = new RequestCreateReview();
        request.setUserId(1);
        request.setGameInfoId(2);
        request.setGameReviewContent("Review");
        request.setGameReviewStar(4);

        // 유저와 게임 정보를 스텁 처리합니다.
        User user = new User();
        user.setUserId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        GameInfo gameInfo = new GameInfo();
        gameInfo.setGameInfoId(2);
        when(gameInfoRepository.findById(2)).thenReturn(Optional.of(gameInfo));

        // 이미 리뷰가 존재하는 경우를 스텁합니다.
        when(gameReviewRepository.existsByUser_UserId(1)).thenReturn(true);

        ResponseCreateReview response = gameInfoService.createReview(request);
        assertNotNull(response);
        assertEquals(400, response.getCode());
        assertEquals("이미 리뷰를 작성하셨습니다.", response.getMessage());
    }

    @Test
    public void testGetReviewList() {
        int gameInfoId = 1;
        GameReview review1 = new GameReview();
        review1.setGameReviewStar(4);
        GameReview review2 = new GameReview();
        review2.setGameReviewStar(5);
        List<GameReview> reviews = Arrays.asList(review1, review2);
        when(gameReviewRepository.findByGameInfo_GameInfoId(gameInfoId)).thenReturn(reviews);

        ResponseReviewList response = gameInfoService.getReviewList(gameInfoId);
        assertNotNull(response);
        assertEquals(reviews, response.getReviewList());
        double expectedAvg = (4 + 5) / 2.0;
        assertEquals(expectedAvg, response.getStarAvg());
    }

    @Test
    public void testDeleteReview() {
        int reviewId = 1;
        GameReview review = new GameReview();
        when(gameReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        gameInfoService.deleteReview(reviewId);
        verify(gameReviewRepository).delete(review);
    }

    @Test
    public void testUpdateReview() {
        int reviewId = 1;
        GameReview review = new GameReview();
        review.setGameReviewContent("Old Review");
        review.setGameReviewStar(3);

        when(gameReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(gameReviewRepository.save(any(GameReview.class))).thenReturn(review);

        RequestUpdateReview request = new RequestUpdateReview();
        request.setGameReviewContent("New Review");
        request.setGameReviewStar(5);

        ResponseUpdateReview response = gameInfoService.updateReview(reviewId, request);
        assertNotNull(response);
        assertEquals("New Review", review.getGameReviewContent());
        assertEquals(5, review.getGameReviewStar());
    }

    @Test
    public void testCreateCommunity() {
        RequestCreateCommunity request = new RequestCreateCommunity();
        request.setUserId(1);
        request.setGameInfoId(2);
        request.setGameCommunityContent("Community content");

        User user = new User();
        user.setUserId(1L);
        GameInfo gameInfo = new GameInfo();
        gameInfo.setGameInfoId(2);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(gameInfoRepository.findById(2)).thenReturn(Optional.of(gameInfo));

        GameCommunity community = new GameCommunity();
        community.setGameCommunityId(10);
        community.setUser(user);
        community.setGameInfo(gameInfo);
        community.setCreateAt(Date.valueOf(LocalDate.now()));

        when(gameCommunityRepository.save(any(GameCommunity.class))).thenReturn(community);

        ResponseCreateCommunity response = gameInfoService.createCommunity(request);
        assertNotNull(response);
        assertEquals(10, response.getGameCommunityId());
        assertEquals(user, response.getUser());
        assertEquals(gameInfo, response.getGameInfo());
        assertNotNull(response.getCreateAt());
    }

    @Test
    public void testGetCommunityList() {
        int gameInfoId = 1;
        GameCommunity community = new GameCommunity();
        community.setGameCommunityId(100);
        User user = new User();
        user.setUserId(1L);
        user.setUserNickname("Tester");
        community.setUser(user);
        community.setGameCommunityContent("Content");

        List<GameCommunity> communities = Collections.singletonList(community);
        when(gameCommunityRepository.findByGameInfo_GameInfoIdAndDeletedAtIsNull(gameInfoId))
                .thenReturn(communities);

        // Stub ModelMapper mapping
        ResponseCommunityList communityDto = new ResponseCommunityList();
        SimpleUserDTO simpleUser = new SimpleUserDTO();
        simpleUser.setUserId(user.getUserId());
        simpleUser.setNickname(user.getUserNickname());
        communityDto.setUser(simpleUser);
        when(mapper.map(community, ResponseCommunityList.class)).thenReturn(communityDto);

        // Stub 댓글 조회 (빈 리스트)
        when(gameCommunityCommentRepository.findByGameCommunity_GameCommunityIdAndDeletedAtIsNull(community.getGameCommunityId()))
                .thenReturn(Collections.emptyList());

        List<ResponseCommunityList> responseList = gameInfoService.getCommunityList(gameInfoId);
        assertNotNull(responseList);
        assertEquals(1, responseList.size());
        ResponseCommunityList result = responseList.get(0);
        assertEquals(user.getUserId(), result.getUser().getUserId());
        assertEquals(user.getUserNickname(), result.getUser().getNickname());
        assertNotNull(result.getCommentList());
        assertTrue(result.getCommentList().isEmpty());
    }

    @Test
    public void testFindCommunity() {
        int gameInfoId = 1;
        int communityId = 10;
        GameCommunity community = new GameCommunity();
        community.setGameCommunityId(communityId);
        when(gameCommunityRepository.findById(communityId)).thenReturn(Optional.of(community));

        GameCommunityComment comment = new GameCommunityComment();
        comment.setGameCommunityCommentId(5);
        List<GameCommunityComment> comments = Collections.singletonList(comment);
        when(gameCommunityCommentRepository.findByGameCommunity_GameCommunityIdAndDeletedAtIsNull(community.getGameCommunityId()))
                .thenReturn(comments);

        ResponseCommunity response = gameInfoService.findCommunity(gameInfoId, communityId);
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("조회 성공", response.getMessage());
        assertEquals(community, response.getGameCommunity());
        assertEquals(comments, response.getCommentList());
    }

    @Test
    public void testCreateComment() {
        RequestCreateComment request = new RequestCreateComment();
        request.setUserId(1);
        request.setGameCommunityId(10);
        request.setContent("Nice comment");

        User user = new User();
        user.setUserId(1L);
        user.setUserNickname("Commenter");
        GameCommunity community = new GameCommunity();
        community.setGameCommunityId(10);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(gameCommunityRepository.findById(10)).thenReturn(Optional.of(community));

        GameCommunityComment comment = new GameCommunityComment();
        comment.setGameCommunityCommentId(100);
        comment.setCreateAt(Date.valueOf(LocalDate.now()));
        when(gameCommunityCommentRepository.save(any(GameCommunityComment.class)))
                .thenReturn(comment);

        ResponseCreateComment response = gameInfoService.createComment(request);
        assertNotNull(response);
        assertEquals(100, response.getGameCommunityCommentId());
        assertEquals("Commenter", response.getUserName());
        assertNotNull(response.getCreatedAt());
    }

    @Test
    public void testUpdateCommunity() {
        int communityId = 10;
        GameCommunity community = new GameCommunity();
        community.setGameCommunityId(communityId);
        community.setGameCommunityContent("Old Content");

        when(gameCommunityRepository.findById(communityId)).thenReturn(Optional.of(community));

        RequestUpdateCommunity request = new RequestUpdateCommunity();
        request.setGameCommunityContent("Updated Content");

        ResponseUpdateCommunity response = gameInfoService.updateCommunity(communityId, request);
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("성공적으로 업데이트 됨", response.getMessage());
        assertEquals("Updated Content", community.getGameCommunityContent());
        verify(gameCommunityRepository).save(community);
    }

    @Test
    public void testDeleteCommunity() {
        int communityId = 10;
        GameCommunity community = new GameCommunity();
        community.setGameCommunityId(communityId);
        when(gameCommunityRepository.findById(communityId)).thenReturn(Optional.of(community));
        when(gameCommunityRepository.save(any(GameCommunity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseDeleteCommunity response = gameInfoService.deleteCommunity(communityId);
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("성공적으로 삭제 됨", response.getMessage());
        assertNotNull(response.getDeletedDate());
    }

    @Test
    public void testUpdateComment() {
        int commentId = 5;
        GameCommunityComment comment = new GameCommunityComment();
        comment.setGameCommunityCommentId(commentId);
        comment.setGameCommunityCommentContent("Old Comment");

        when(gameCommunityCommentRepository.findById(commentId)).thenReturn(Optional.of(comment));

        RequestUpdateComment request = new RequestUpdateComment();
        request.setContent("New Comment");

        ResponseUpdateComment response = gameInfoService.updateComment(commentId, request);
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("성공적으로 업데이트 됨", response.getMessage());
        assertEquals("New Comment", comment.getGameCommunityCommentContent());
        verify(gameCommunityCommentRepository).save(comment);
    }

    @Test
    public void testDeleteComment() {
        int commentId = 5;
        GameCommunityComment comment = new GameCommunityComment();
        comment.setGameCommunityCommentId(commentId);
        when(gameCommunityCommentRepository.findById(commentId)).thenReturn(Optional.of(comment));
        when(gameCommunityCommentRepository.save(any(GameCommunityComment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseDeleteComment response = gameInfoService.deleteComment(commentId);
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("성공적으로 삭제 됨", response.getMessage());
        assertNotNull(response.getDeletedDate());
    }
}

