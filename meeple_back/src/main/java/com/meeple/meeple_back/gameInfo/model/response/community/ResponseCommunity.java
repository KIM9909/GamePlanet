package com.meeple.meeple_back.gameInfo.model.response.community;

import com.meeple.meeple_back.gameInfo.model.entity.GameCommunity;
import com.meeple.meeple_back.gameInfo.model.entity.GameCommunityComment;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseCommunity {
    private int code;
    private String message;
    private GameCommunity gameCommunity;
    private List<GameCommunityComment> commentList;
}
