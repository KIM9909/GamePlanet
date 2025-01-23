package com.meeple.meeple_back.game.cockroach.model.response;

import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseMultiCard {
    List<String> players;
    Map<String, Object> gameData;
}
