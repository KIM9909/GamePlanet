package com.meeple.meeple_back.friend.service;

import com.meeple.meeple_back.friend.model.FriendStatus;
import com.meeple.meeple_back.friend.model.entity.Friend;
import com.meeple.meeple_back.friend.model.entity.FriendMessage;
import com.meeple.meeple_back.friend.model.request.RequestFriend;
import com.meeple.meeple_back.friend.model.request.RequestProcess;
import com.meeple.meeple_back.friend.model.request.RequestSendFriendMessage;
import com.meeple.meeple_back.friend.model.response.*;
import com.meeple.meeple_back.friend.repository.FriendMessageRepository;
import com.meeple.meeple_back.friend.repository.FriendRepository;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FriendServiceImpl implements FriendService {
    private final FriendRepository friendRepository;
    private final UserRepository userRepository;
    private final FriendMessageRepository friendMessageRepository;
    private final SimpMessageSendingOperations messagingTemplate;
    private final ModelMapper mapper;

    @Override
    public List<ResponseFriendList> findFriendList(long userId) {
        List<Friend> friendList = friendRepository.findByUser_UserId(userId);

        List<ResponseFriendList> responseFriendList = friendList.stream()
                .map(friend -> {
                    ResponseFriendList response = new ResponseFriendList();
                    response.setFriendId(friend.getFriendId());
                    response.setFriendStatus(friend.getFriendStatus());
                    response.setFriend(friend.getFriend()); // friend 필드 (User 객체)
                    return response;
                })
                .collect(Collectors.toList());

        return responseFriendList;
    }

    @Override
    public void requestFriend(long userId, RequestFriend request) {
        User from = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 회원입니다."));

        User to = userRepository.findById(request.getFriendId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 친구입니다."));

        boolean exists = friendRepository.existsByUserAndFriend(to, from);
        if (exists) {
            messagingTemplate
                    .convertAndSend("/topic/friend/" + userId, "이미 친구 요청이 존재합니다.");
            throw new IllegalStateException("이미 친구 요청이 존재합니다.");
        }

        Friend friend = Friend.builder()
                .user(from)
                .friend(to)
                .friendStatus(FriendStatus.PENDING)
                .build();
        Friend savedFriendRequest = friendRepository.save(friend);

        ResponseFriend response = ResponseFriend.builder()
                .friendId(savedFriendRequest.getFriendId())
                .senderId(userId)
                .senderName(from.getUserNickname())
                .message(from.getUserNickname() + "님이 친구 요청을 보냈습니다.")
                .build();

        messagingTemplate.convertAndSend("/topic/friend/" + request.getFriendId(), response);

        response.setMessage(to.getUserNickname() + "님에게 친구 요청을 보냈습니다.");

        messagingTemplate.convertAndSend("/topic/friend/" + userId, response);
    }

    @Override
    public void processRequest(int friendId, RequestProcess request) {
        Friend friend = friendRepository.findById(friendId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 pk입니다."));

        /* 친구 요청을 받은쪽이 요청을 할 경우 */
        if (friend.getFriend().getUserId() == request.getRequesterId()) {
            if (request.getRequirements().equals("DENY")) {     // 거절
                friendRepository.delete(friend);
            } else if (request.getRequirements().equals("ACCEPT")) {    // 승인
                friend.setFriendStatus(FriendStatus.ACCEPTED);
                friendRepository.save(friend);

                Friend newFriend = Friend.builder()
                        .friendStatus(FriendStatus.ACCEPTED)
                        .friend(friend.getUser())
                        .user(friend.getFriend())
                        .build();

                friendRepository.save(newFriend);
            }
        }
    }

    @Override
    public void deleteFriend(int friendId) {
        Friend friend = friendRepository.findById(friendId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 pk입니다."));

        friendRepository.delete(friend);
    }

    @Override
    public ResponseSendFriendMessage sendMessage(RequestSendFriendMessage request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 회원"));

        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 발송자"));

        FriendMessage friendMessage = FriendMessage.builder()
                .content(request.getContent())
                .sender(sender)
                .user(user)
                .build();

        friendMessageRepository.save(friendMessage);

        ResponseSendFriendMessage response = ResponseSendFriendMessage.builder()
                .code(200)
                .message("발송 성공")
                .build();

        return response;
    }

    @Override
    public List<ResponseFriendMessageList> getMessageList(long userId) {
        List<FriendMessage> messageList = friendMessageRepository.findByUser_UserId(userId);

        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        return messageList.stream().map(message -> mapper
                        .map(message, ResponseFriendMessageList.class))
                .collect(Collectors.toList());
    }

    @Override
    public ResponseSearchUser searchUser(String userNickName) {
        try {
            User user = userRepository.findByUserNickname(userNickName);
            ResponseSearchUser response = ResponseSearchUser.builder()
                    .userId(user.getUserId())
                    .code(200)
                    .message("조회 성공")
                    .build();

            return response;
        } catch (Exception e) {
            ResponseSearchUser response = ResponseSearchUser.builder()
                    .code(400)
                    .message("존재하지 않는 닉네임입니다.")
                    .build();
        }
        ResponseSearchUser response = ResponseSearchUser.builder()
                .code(500)
                .message("조회 실패")
                .build();

        return response;
    }
}
