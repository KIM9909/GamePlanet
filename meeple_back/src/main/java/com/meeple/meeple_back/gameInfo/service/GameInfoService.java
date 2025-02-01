package com.meeple.meeple_back.gameInfo.service;

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

import java.util.List;

public interface GameInfoService {
   ResponseGameInfoList getGameInfoList();

    ResponseCreateGameInfo createGameInfo(RequestCreateGameInfo request);

    ResponseGameInfo getGameInfo(int gameInfoId);

    ResponseUpdateGameInfo updateGameInfo(int gameInfoId, RequestUpdateGameInfo request);

    ResponseDeleteGameInfo deleteGameInfo(int gameInfoId);

    ResponseCreateReview createReview(RequestCreateReview request);

 ResponseReviewList getReviewList(int gameInfoId);

 void deleteReview(int reviewId);

 ResponseUpdateReview updateReview(int reviewId, RequestUpdateReview request);

 ResponseCreateCommunity createCommunity(RequestCreateCommunity request);

 List<ResponseCommunityList> getCommunityList(int gameInfoId);
}
