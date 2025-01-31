package com.meeple.meeple_back.game.cockroach.model.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ResponseExitRoom {
    List<String> players;
}
