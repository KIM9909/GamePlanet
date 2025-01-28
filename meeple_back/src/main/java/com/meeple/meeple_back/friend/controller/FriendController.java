package com.meeple.meeple_back.friend.controller;

import com.meeple.meeple_back.friend.model.request.RequestFriend;
import com.meeple.meeple_back.friend.model.request.RequestProcess;
import com.meeple.meeple_back.friend.model.response.ResponseFriendList;
import com.meeple.meeple_back.friend.service.FriendService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friend")
@AllArgsConstructor
public class FriendController {
    private final FriendService friendService;

    @GetMapping
    public ResponseEntity<List<ResponseFriendList>> responseFriendList(
            @RequestParam long userId
    ){
        List<ResponseFriendList> response = friendService.findFriendList(userId);

        return ResponseEntity.ok(response);
    }

    @MessageMapping("/request-friend/{userId}")
    public void requestFriend(
            @DestinationVariable long userId,
            @RequestBody RequestFriend request
    ) {
        friendService.requestFriend(userId, request);
    }

    @MessageMapping("/process-request/{friendId}")
    public void processRequest(
            @DestinationVariable int friendId,
            @RequestBody RequestProcess request
    ) {
        friendService.processRequest(friendId, request);
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<String> deleteFreind(
            @PathVariable int friendId
    ) {
        friendService.deleteFriend(friendId);

        return ResponseEntity.ok("삭제 완료");
    }

}
