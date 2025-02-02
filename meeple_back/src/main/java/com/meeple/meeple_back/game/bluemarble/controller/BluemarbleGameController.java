package com.meeple.meeple_back.game.bluemarble.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "게임플레이(블루마블)")
@Builder
@RequiredArgsConstructor
@RequestMapping("/game/blue-marble/game-plays")
public class BluemarbleGameController {

}
