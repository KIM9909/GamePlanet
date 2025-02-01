package com.meeple.meeple_back.friend.controller;

import com.meeple.meeple_back.friend.model.request.RequestFriend;
import com.meeple.meeple_back.friend.model.request.RequestProcess;
import com.meeple.meeple_back.friend.model.request.RequestSendFriendMessage;
import com.meeple.meeple_back.friend.model.response.ResponseFriendList;
import com.meeple.meeple_back.friend.model.response.ResponseFriendMessageList;
import com.meeple.meeple_back.friend.model.response.ResponseSearchUser;
import com.meeple.meeple_back.friend.model.response.ResponseSendFriendMessage;
import com.meeple.meeple_back.friend.service.FriendService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/friend")
@AllArgsConstructor
@Tag(name = "Friend", description = "친구 관련 API")
public class FriendController {
    private final FriendService friendService;

    @Operation(summary = "친구 목록 조회", description = "특정 사용자의 친구 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<ResponseFriendList>> responseFriendList(
            @Parameter(description = "조회할 사용자의 ID", required = true)
            @RequestParam long userId
    ) {
        List<ResponseFriendList> response = friendService.findFriendList(userId);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "친구 요청 보내기 (WebSocket)", description = "사용자가 WebSocket을 통해 친구 요청을 보냅니다.")
    @PostMapping("/request-friend/{userId}")  // REST API 엔드포인트 추가 (Swagger 문서화용)
    public ResponseEntity<String> requestFriend(
            @Parameter(description = "친구 요청을 보내는 사용자의 ID", required = true)
            @PathVariable long userId,
            @RequestBody RequestFriend request
    ) {
        // Swagger에서 문서화되도록 REST API 형태로 추가 (실제 WebSocket 처리와는 별개)
        return ResponseEntity.ok("WebSocket 요청을 ws://localhost:8090/ws/friend 로 보내세요.");
    }

    @MessageMapping("/friend/request-friend/{userId}")
    public void requestFriendSocket(
            @DestinationVariable long userId,
            @RequestBody RequestFriend request
    ) {
        friendService.requestFriend(userId, request);
    }

    @Operation(summary = "친구 요청 처리 (WebSocket)", description = "사용자가 WebSocket을 통해 친구 요청을 승인 또는 거절합니다.")
    @PostMapping("process-request/{friendId}")  // REST API 엔드포인트 추가 (Swagger 문서화용)
    public ResponseEntity<String> processRequest(
            @Parameter(description = "처리할 친구 요청의 ID", required = true)
            @PathVariable int friendId,
            @RequestBody RequestProcess request
    ) {
        return ResponseEntity.ok("WebSocket 요청을 ws://localhost:8090/ws/friend/process-request 로 보내세요.");
    }

    @MessageMapping("/friend/process-request/{friendId}")
    public void processRequestSocket(
            @Parameter(description = "처리할 친구 요청의 ID", required = true)
            @DestinationVariable int friendId,
            @RequestBody RequestProcess request
    ) {
        friendService.processRequest(friendId, request);
    }

    @Operation(summary = "친구 삭제", description = "특정 친구를 목록에서 삭제합니다.")
    @DeleteMapping("/{friendId}")
    public ResponseEntity<String> deleteFreind(
            @Parameter(description = "삭제할 친구의 ID", required = true)
            @PathVariable int friendId
    ) {
        friendService.deleteFriend(friendId);

        return ResponseEntity.ok("삭제 완료");
    }

    @Operation(summary = "메세지 발송", description = "친구에게 쪽지를 발송합니다")
    @PostMapping("/message")
    public ResponseEntity<ResponseSendFriendMessage> sendMessage(
            @RequestBody RequestSendFriendMessage request
    ) {
        ResponseSendFriendMessage response = friendService.sendMessage(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "쪽지 목록 조회", description = "쪽지 목록을 확인합니다")
    @GetMapping("/message")
    public ResponseEntity<List<ResponseFriendMessageList>> getMessageList(
            @Parameter(description = "조회할 사용자의 PK", required = true)
            @RequestParam long userId
    ) {
        List<ResponseFriendMessageList> response = friendService.getMessageList(userId);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "닉네임으로 친구 검색", description = "닉네임으로 친구 추가할 유저를 찾습니다.")
    @GetMapping("/search")
    public ResponseEntity<ResponseSearchUser> searchUser(
            @RequestParam String userNickName
    ) {
        ResponseSearchUser response = friendService.searchUser(userNickName);

        return ResponseEntity.ok(response);
    }

}
