package com.meeple.meeple_back.game.catchmind.model.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ResponseExitCatchmindRoom {
    private List<String> players;
}
