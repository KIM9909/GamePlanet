package com.meeple.meeple_back.admin.report.model.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ResponseDeleteUser {
    private int code;
    private String message;
}
