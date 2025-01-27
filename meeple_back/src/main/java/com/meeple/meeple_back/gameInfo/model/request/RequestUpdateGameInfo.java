package com.meeple.meeple_back.gameInfo.model.request;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class RequestUpdateGameInfo {
    private String gameInfoContent;

    private String gameRule;
}
