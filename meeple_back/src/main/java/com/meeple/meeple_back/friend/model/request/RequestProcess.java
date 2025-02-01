package com.meeple.meeple_back.friend.model.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "친구 요청 처리 요청 모델")  // 전체 DTO 설명
public class RequestProcess {

    @Schema(description = "요청을 보낸 사용자의 ID", example = "123")
    private long requesterId;

    @Schema(description = "요청을 받는 사용자의 ID", example = "456")
    private long targetId;

    @Schema(description = "추가 요구 사항 또는 메시지", example = "친구 요청을 수락해 주세요.")
    private String requirements;
}
