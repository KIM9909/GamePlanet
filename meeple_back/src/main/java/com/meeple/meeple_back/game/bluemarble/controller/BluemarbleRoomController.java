package com.meeple.meeple_back.game.bluemarble.controller;

import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleRoomService;
import com.meeple.meeple_back.game.bluemarble.controller.request.RoomJoinWithPassword;
import com.meeple.meeple_back.game.bluemarble.controller.request.RoomUpdatePassword;
import com.meeple.meeple_back.game.bluemarble.controller.response.RoomResponse;
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
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "게임방(블루마블) 소켓 통신")
@RestController
@RequestMapping("/game/blue-marble/rooms")
@Builder
@RequiredArgsConstructor
public class BluemarbleRoomController {

	private final BluemarbleRoomService bluemarbleRoomService;
	private final SimpMessageSendingOperations messagingTemplate;


	private final JwtUtil jwtUtil;

	@MessageMapping("/{roomId}/user/{userId}")
	@Operation(summary = "게임방 참가", description = "게임방에 참가합니다.")
	public void join(@DestinationVariable("roomId") int roomId,
			@DestinationVariable("userId") long userId) {
		RoomResponse roomResponse = RoomResponse.from(bluemarbleRoomService.join(roomId, userId));
		messagingTemplate.convertAndSend("/topic/rooms/" + roomId,
				roomResponse);
	}

	@MessageMapping("/{roomId}/private-room/{userId}")
	@Operation(summary = "private게임방 참가", description = "게임방에 참가합니다.")
	public void joinWithPassword(@DestinationVariable("roomId") int roomId,
			@RequestBody RoomJoinWithPassword roomJoinWithPassword) {
		RoomResponse roomResponse = RoomResponse.from(
				bluemarbleRoomService.joinWithPassword(roomId, roomJoinWithPassword));
		messagingTemplate.convertAndSend("/topic/rooms/" + roomId,
				roomResponse);
	}

	@GetMapping
	@Operation(summary = "게임방 목록 조회", description = "생성된 게임방 목록을 조회합니다.")
	public ResponseEntity<List<RoomResponse>> getRooms() {
		return ResponseEntity.status(HttpStatus.OK).body(bluemarbleRoomService.getList().stream()
				.map(RoomResponse::from).toList());
	}

	@GetMapping("/{searchName}/search")
	@Operation(summary = "게임방 이름으로 검색", description = "게임방 이름으로 검색합니다.")
	public ResponseEntity<List<RoomResponse>> searchRooms(@PathVariable String searchName) {
		return ResponseEntity.status(HttpStatus.OK)
				.body(bluemarbleRoomService.search(searchName).stream()
						.map(RoomResponse::from).toList());
	}


	@GetMapping("/{roomId}")
	@Operation(summary = "게임방 조회", description = "게임방을 조회합니다.")
	public ResponseEntity<RoomResponse> getRoom(@PathVariable int roomId) {
		return ResponseEntity.ok(RoomResponse.from(bluemarbleRoomService.findById(roomId)));
	}

	@DeleteMapping("/{roomId}/user/{userId}")
	@Operation(summary = "게임방 삭제", description = "게임방을 삭제합니다.")
	public ResponseEntity<RoomResponse> delete(@PathVariable int roomId,
			@PathVariable("userId") Long userId) {
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

	@PutMapping("/{roomId}/change-password")
	@Operation(summary = "게임방 비밀번호 변경", description = "게임방 비밀번호를 변경합니다.")
	public ResponseEntity<Void> changePassword(@PathVariable int roomId,
			@Valid @RequestBody RoomUpdatePassword roomUpdatePassword) {
		bluemarbleRoomService.changePassword(roomId, roomUpdatePassword);
		return ResponseEntity.ok().build();
	}


}
