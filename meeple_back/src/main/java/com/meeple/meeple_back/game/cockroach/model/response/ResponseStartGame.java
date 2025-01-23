package com.meeple.meeple_back.game.cockroach.model.response;

import com.meeple.meeple_back.game.cockroach.model.entity.Player;
import com.meeple.meeple_back.user.model.User;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class ResponseStartGame {
    List<String> players;
    Map<String, Object> gameData;
}
