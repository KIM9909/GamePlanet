package com.meeple.meeple_back.gameInfo.model.response.gameReview;

import com.meeple.meeple_back.gameInfo.model.entity.GameInfo;
import com.meeple.meeple_back.user.model.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Builder
@Data
public class ResponseCreateReview {
    @Schema(description = "상태 코드", example = "200", required = true)
    private int code;
    @Schema(description = "상태 메세지", example = "정상 작동", required = true)
    private String message;
    @Schema(description = "게임 리뷰 PK", example = "1", required = true)
    private int reviewId;
    @Schema(description = "사용자 정보", example = "{userId: 1, userName: 이름, ...}", required = true)
    private User user;
    @Schema(description = "사용자 정보", example = "{gameInfoId: 1, ...}", required = true)
    private GameInfo gameInfo;
}
