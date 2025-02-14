package com.meeple.meeple_back.admin.report.model.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class RequestProcessReport {
    @Schema(description = "신고 PK", example = "1")
    private int reportId;
    @Schema(description = "처리 결과", example = "BAN")
    private String reportResult;
    @Schema(description = "신고 처리 메모", example = "~~해서 이렇게 처리함")
    private String reportMemo;
}
