package com.meeple.meeple_back.game.bluemarble.controller;

import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleRoomService;
import com.meeple.meeple_back.game.bluemarble.controller.response.RoomResponse;
import com.meeple.meeple_back.game.bluemarble.domain.RoomCreate;
import com.meeple.meeple_back.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "게임방(블루마블)")
@RestController
@RequestMapping("/game/blue-marble/rooms")
@Builder
@RequiredArgsConstructor
public class BluemarbleRoomCreateController {

	private final BluemarbleRoomService bluemarbleRoomService;
	private final JwtUtil jwtUtil;

	@PostMapping
	@Operation(summary = "게임방 생성", description = "새로운 블루마블 게임방을 생성합니다.")
	public ResponseEntity<RoomResponse> create(@Valid @RequestBody RoomCreate roomCreate,
			@RequestHeader("Authorization") String token) {
		long userId = jwtUtil.getUserIdFromToken(token);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(RoomResponse.from(bluemarbleRoomService.create(userId, roomCreate)));
	}
}
