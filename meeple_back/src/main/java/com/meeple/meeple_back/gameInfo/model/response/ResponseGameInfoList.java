package com.meeple.meeple_back.gameInfo.model.response;

import com.meeple.meeple_back.gameInfo.model.entity.GameInfo;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ResponseGameInfoList {
    List<GameInfo> gameInfoList;
}
