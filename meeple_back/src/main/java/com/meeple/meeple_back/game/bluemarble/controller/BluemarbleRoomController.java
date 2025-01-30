package com.meeple.meeple_back.game.bluemarble.controller;

import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleRoomService;
import com.meeple.meeple_back.game.bluemarble.controller.response.RoomResponse;
import com.meeple.meeple_back.game.bluemarble.domain.RoomCreate;
import com.meeple.meeple_back.game.bluemarble.domain.RoomUpdate;
import com.meeple.meeple_back.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "게임방(블루마블)")
@RestController
@RequestMapping("/game/blue-marble/rooms")
@Builder
@RequiredArgsConstructor
public class BluemarbleRoomController {

	private final BluemarbleRoomService bluemarbleRoomService;

	private final JwtUtil jwtUtil;

	@PostMapping
	@Operation(summary = "게임방 생성", description = "새로운 블루마블 게임방을 생성합니다.")
	public ResponseEntity<RoomResponse> create(@Valid @RequestBody RoomCreate roomCreate) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(RoomResponse.from(bluemarbleRoomService.create(roomCreate)));
	}

	@PostMapping("/{roomId}")
	@Operation(summary = "게임방 참가", description = "게임방에 참가합��다.")
	public ResponseEntity<RoomResponse> join(@PathVariable int roomId,
			@RequestHeader("Authorization") String token) {
		long userId = jwtUtil.getUserIdFromToken(token);
		return ResponseEntity.ok(RoomResponse.from(bluemarbleRoomService.join(roomId, userId)));
	}

	@GetMapping
	@Operation(summary = "게임방 목록 조회", description = "생성된 게임방 목록을 조회합니다.")
	public ResponseEntity<List<RoomResponse>> getRooms() {
		return ResponseEntity.ok(
				bluemarbleRoomService.getList().stream().map(RoomResponse::from).toList());
	}

	@DeleteMapping("/{roomId}")
	@Operation(summary = "게임방 삭제", description = "게임방을 삭제합니다.")
	public ResponseEntity<RoomResponse> delete(@PathVariable int roomId,
			@RequestHeader("Authorization") String token) {
		long userId = jwtUtil.getUserIdFromToken(token);
		return ResponseEntity.status(HttpStatus.NO_CONTENT)
				.body(RoomResponse.from(bluemarbleRoomService.delete(roomId, userId)));
	}

	@PutMapping("/{roomId}")
	@Operation(summary = "게임방 수정", description = "게임방을 수정합니다.")
	public ResponseEntity<RoomResponse> update(@PathVariable int roomId,
			@Valid @RequestBody RoomUpdate roomUpdate) {
		return ResponseEntity.ok(
				RoomResponse.from(bluemarbleRoomService.update(roomId, roomUpdate)));
	}


}
