package com.meeple.meeple_back.friend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;


import com.meeple.meeple_back.friend.model.FriendStatus;
import com.meeple.meeple_back.friend.model.entity.Friend;
import com.meeple.meeple_back.friend.model.entity.FriendMessage;
import com.meeple.meeple_back.friend.model.request.RequestFriend;
import com.meeple.meeple_back.friend.model.request.RequestProcess;
import com.meeple.meeple_back.friend.model.request.RequestProcessBlock;
import com.meeple.meeple_back.friend.model.request.RequestSendFriendMessage;
import com.meeple.meeple_back.friend.model.response.ResponseDeleteFriend;
import com.meeple.meeple_back.friend.model.response.ResponseDeleteFriendRequest;
import com.meeple.meeple_back.friend.model.response.ResponseDeleteMessage;
import com.meeple.meeple_back.friend.model.response.ResponseFriend;
import com.meeple.meeple_back.friend.model.response.ResponseFriendList;
import com.meeple.meeple_back.friend.model.response.ResponseFriendProcess;
import com.meeple.meeple_back.friend.model.response.ResponseFriendRequestList;
import com.meeple.meeple_back.friend.model.response.ResponseProcessBlock;
import com.meeple.meeple_back.friend.model.response.ResponseSearchUser;
import com.meeple.meeple_back.friend.model.response.ResponseSendFriendMessage;
import com.meeple.meeple_back.friend.repository.FriendRepository;
import com.meeple.meeple_back.friend.service.FriendServiceImpl;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.messaging.simp.SimpMessageSendingOperations;

@ExtendWith(MockitoExtension.class)
public class FriendServiceTest {

    @Mock
    private FriendRepository friendRepository;

    @Mock
    private UserRepository userRepository;

    // FriendMessageRepository 등 다른 의존성도 필요한 경우 Mock 처리
    @Mock
    private com.meeple.meeple_back.friend.repository.FriendMessageRepository friendMessageRepository;

    @Mock
    private SimpMessageSendingOperations messagingTemplate;

    // ModelMapper는 특별한 설정 없이 사용할 수 있도록 @Spy로 처리
    @Spy
    private ModelMapper mapper = new ModelMapper();

    @InjectMocks
    private FriendServiceImpl friendService;

    @BeforeEach
    public void setup() {
        // 필요에 따라 mapper나 기타 설정 추가
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
    }


    @Test
    public void testFindFriendList() {
        // given
        long userId = 1L;

        // 친구 목록에 들어갈 대상 User 생성
        User friendUser = new User();
        friendUser.setUserId(2L);
        friendUser.setUserNickname("Bob");

        // Friend 엔티티 생성 (친구 상태: ACCEPTED)
        Friend friend = Friend.builder()
            .friendId(10)
            .friendStatus(FriendStatus.ACCEPTED)
            // Service에서는 friend.getFriend()로 User 정보를 참조합니다.
            .friend(friendUser)
            .build();
        List<Friend> friendList = Arrays.asList(friend);

        // friendRepository 모킹: userId와 ACCEPTED 상태의 친구 목록 반환
        when(friendRepository.findByUser_UserIdAndFriendStatus(userId, FriendStatus.ACCEPTED))
            .thenReturn(friendList);

        // when
        List<ResponseFriendList> result = friendService.findFriendList(userId);

        // then
        assertNotNull(result);
        assertEquals(1, result.size());

        ResponseFriendList response = result.get(0);
        assertEquals(10L, response.getFriendId());
        assertEquals(FriendStatus.ACCEPTED, response.getFriendStatus());
        assertNotNull(response.getFriend());
        assertEquals(2L, response.getFriend().getUserId());
        assertEquals("Bob", response.getFriend().getNickname());
    }

    @Test
    public void testFriendRequestList() {
        // given
        long userId = 1L;

        // [요청 보낸 목록] - 요청을 보낸 대상 User 생성
        User targetUser = new User();
        targetUser.setUserId(2L);
        targetUser.setUserNickname("Alice");

        Friend requestingFriend = Friend.builder()
            .friendId(20)
            .friendStatus(FriendStatus.PENDING)
            // 요청 보낸 경우, friend 필드에 요청 대상 User 정보가 들어갑니다.
            .friend(targetUser)
            .build();
        List<Friend> requestingList = Arrays.asList(requestingFriend);

        // [요청 받은 목록] - 요청을 받은 쪽의 User 생성
        User requesterUser = new User();
        requesterUser.setUserId(3L);
        requesterUser.setUserNickname("Charlie");

        Friend requestedFriend = Friend.builder()
            .friendId(21)
            .friendStatus(FriendStatus.PENDING)
            // 요청 받은 경우, user 필드에 요청 보낸 User 정보가 들어갑니다.
            .user(requesterUser)
            .build();
        List<Friend> requestedList = Arrays.asList(requestedFriend);

        // friendRepository 모킹
        when(friendRepository.findByUser_UserIdAndFriendStatus(userId, FriendStatus.PENDING))
            .thenReturn(requestingList);
        when(friendRepository.findByFriend_UserIdAndFriendStatus(userId, FriendStatus.PENDING))
            .thenReturn(requestedList);

        // when
        ResponseFriendRequestList response = friendService.friendRequestList(userId);

        // then
        assertNotNull(response);
        assertNotNull(response.getRequestingList());
        assertNotNull(response.getRequestedList());
        assertEquals(1, response.getRequestingList().size());
        assertEquals(1, response.getRequestedList().size());

        // 요청 보낸 목록 확인
        Friend reqFriend = response.getRequestingList().get(0);
        assertEquals(20L, reqFriend.getFriendId());
        assertEquals(FriendStatus.PENDING, reqFriend.getFriendStatus());

        // 요청 받은 목록 확인
        Friend recFriend = response.getRequestedList().get(0);
        assertEquals(21L, recFriend.getFriendId());
        assertEquals(FriendStatus.PENDING, recFriend.getFriendStatus());
    }

    @Test
    public void testFindBlockingList() {
        // given
        long userId = 1L;

        // 차단 목록에 들어갈 대상 User 생성
        User blockingUser = new User();
        blockingUser.setUserId(4L);
        blockingUser.setUserNickname("David");

        // Friend 엔티티 생성 (친구 상태: BLOCKING)
        Friend blockingFriend = Friend.builder()
            .friendId(30)
            .friendStatus(FriendStatus.BLOCKING)
            .friend(blockingUser)
            .build();
        List<Friend> blockingList = Arrays.asList(blockingFriend);

        // friendRepository 모킹: userId와 BLOCKING 상태의 친구 목록 반환
        when(friendRepository.findByUser_UserIdAndFriendStatus(userId, FriendStatus.BLOCKING))
            .thenReturn(blockingList);

        // when
        List<ResponseFriendList> result = friendService.findBlockingList(userId);

        // then
        assertNotNull(result);
        assertEquals(1, result.size());

        ResponseFriendList response = result.get(0);
        assertEquals(30, response.getFriendId());
        assertEquals(FriendStatus.BLOCKING, response.getFriendStatus());
        assertNotNull(response.getFriend());
        assertEquals(4L, response.getFriend().getUserId());
        assertEquals("David", response.getFriend().getNickname());
    }


    @Test
    public void testRequestFriend_Success() {
        // Arrange
        RequestFriend request = new RequestFriend();
        request.setUserId(1L);
        request.setFriendId(2L);

        User sender = new User();
        sender.setUserId(1L);
        sender.setUserNickname("Alice");

        User target = new User();
        target.setUserId(2L);
        target.setUserNickname("Bob");

        // userRepository에서 sender와 target을 찾을 수 있도록 설정
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));

        // 이미 친구 관계가 없는 경우 (요청 전)
        when(friendRepository.existsByUserAndFriend(sender, target)).thenReturn(false);
        when(friendRepository.existsByUserAndFriend(target, sender)).thenReturn(false);

        // 저장 시 리턴될 Friend 객체 설정
        Friend friend = Friend.builder()
            .friendId(10)
            .user(sender)
            .friend(target)
            .friendStatus(FriendStatus.PENDING)
            .build();
        when(friendRepository.save(any(Friend.class))).thenReturn(friend);

        // Act
        ResponseFriend response = friendService.requestFriend(request);

        // Assert
        assertNotNull(response);
        assertEquals(10, response.getFriendId());
        assertTrue(response.getMessage().contains("친구 요청을 보내셨습니다."));

        // messagingTemplate의 convertAndSend 메서드가 호출되었는지 검증
        verify(messagingTemplate)
            .convertAndSend(eq("/topic/user/" + target.getUserId()), anyString());
    }

    // ------------------ processRequest() 테스트 ------------------

    // DENY: 친구 요청 거절 시
    @Test
    public void testProcessRequest_Deny() {
        // Arrange
        RequestProcess request = new RequestProcess();
        request.setFriendId(1);
        request.setRequirements("DENY");

        User sender = new User();
        sender.setUserId(10L);
        sender.setUserNickname("Alice");

        User friendUser = new User();
        friendUser.setUserId(20L);
        friendUser.setUserNickname("Bob");

        Friend friend = Friend.builder()
            .friendId(1)
            .friendStatus(FriendStatus.PENDING)
            .user(sender)
            .friend(friendUser)
            .build();

        when(friendRepository.findById(1)).thenReturn(Optional.of(friend));

        // Act
        ResponseFriendProcess response = friendService.processRequest(request);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertTrue(response.getMessage().contains("Alice님이 보내신 친구 요청이 거절되었습니다."));
        verify(friendRepository).delete(friend);
    }

    // ACCEPT: 친구 요청 승인 시 (양방향 저장 및 메시지 전송)
    @Test
    public void testProcessRequest_Accept() {
        // Arrange
        RequestProcess request = new RequestProcess();
        request.setFriendId(2);
        request.setRequirements("ACCEPT");

        User sender = new User();
        sender.setUserId(10L);
        sender.setUserNickname("Alice");

        User friendUser = new User();
        friendUser.setUserId(20L);
        friendUser.setUserNickname("Bob");

        Friend friend = Friend.builder()
            .friendId(2)
            .friendStatus(FriendStatus.PENDING)
            .user(sender)
            .friend(friendUser)
            .build();

        when(friendRepository.findById(2)).thenReturn(Optional.of(friend));
        // 저장시 동일 객체 또는 새롭게 저장된 객체를 리턴하도록 설정
        when(friendRepository.save(any(Friend.class))).thenReturn(friend);

        // Act
        ResponseFriendProcess response = friendService.processRequest(request);

        // Assert
        assertNotNull(response);
        assertEquals(201, response.getCode());
        assertTrue(response.getMessage().contains("Alice님이 발송하신 친구 요청이 승인되었습니다."));
        // 승인 시 friendRepository.save()가 두 번 호출 (기존 객체, 양방향 객체)
        verify(friendRepository, times(2)).save(any(Friend.class));
        // 메시지 전송이 제대로 호출되었는지 확인
        verify(messagingTemplate).convertAndSend(eq("/topic/user/" + sender.getUserId()),
            anyString());
    }

    // BLOCK: 친구 요청 차단 시
    @Test
    public void testProcessRequest_Block() {
        // Arrange
        RequestProcess request = new RequestProcess();
        request.setFriendId(3);
        request.setRequirements("BLOCK");

        User sender = new User();
        sender.setUserId(10L);
        sender.setUserNickname("Alice");

        User friendUser = new User();
        friendUser.setUserId(20L);
        friendUser.setUserNickname("Bob");

        Friend friend = Friend.builder()
            .friendId(3)
            .friendStatus(FriendStatus.PENDING)
            .user(sender)
            .friend(friendUser)
            .build();

        when(friendRepository.findById(3)).thenReturn(Optional.of(friend));
        when(friendRepository.save(any(Friend.class))).thenReturn(friend);

        // Act
        ResponseFriendProcess response = friendService.processRequest(request);

        // Assert
        assertNotNull(response);
        assertEquals(202, response.getCode());
        assertTrue(response.getMessage().contains("Alice님이 차단되었습니다."));
        // 차단 시 friendRepository.save()가 두 번 호출
        verify(friendRepository, times(2)).save(any(Friend.class));
    }

    // 잘못된 requirements 입력 시
    @Test
    public void testProcessRequest_InvalidRequirement() {
        // Arrange
        RequestProcess request = new RequestProcess();
        request.setFriendId(4);
        request.setRequirements("INVALID");

        User sender = new User();
        sender.setUserId(10L);
        sender.setUserNickname("Alice");

        User friendUser = new User();
        friendUser.setUserId(20L);
        friendUser.setUserNickname("Bob");

        Friend friend = Friend.builder()
            .friendId(4)
            .friendStatus(FriendStatus.PENDING)
            .user(sender)
            .friend(friendUser)
            .build();

        when(friendRepository.findById(4)).thenReturn(Optional.of(friend));

        // Act
        ResponseFriendProcess response = friendService.processRequest(request);

        // Assert
        assertNotNull(response);
        assertEquals(500, response.getCode());
        assertEquals("친구 요청 문제 발생 requirements를 다시 확인해주세요.", response.getMessage());
    }

    // ------------------ processBlock() 테스트 ------------------

    @Test
    public void testProcessBlock() {
        // Arrange
        RequestProcessBlock request = new RequestProcessBlock();
        request.setFriendId(5);

        User sender = new User();
        sender.setUserId(10L);
        sender.setUserNickname("Alice");

        User friendUser = new User();
        friendUser.setUserId(20L);
        friendUser.setUserNickname("Bob");

        Friend friend = Friend.builder()
            .friendId(5)
            .user(sender)
            .friend(friendUser)
            .build();

        // 양방향 삭제를 위한 반대편 Friend 엔티티
        Friend friendReverse = Friend.builder()
            .friendId(6)
            .user(friendUser)
            .friend(sender)
            .build();

        when(friendRepository.findById(5)).thenReturn(Optional.of(friend));
        // 코드에서는 targetId와 fromId를 역으로 찾아 삭제함
        when(friendRepository.findByUser_UserIdAndFriend_UserId(friendUser.getUserId(),
            sender.getUserId()))
            .thenReturn(friendReverse);

        // Act
        ResponseProcessBlock response = friendService.processBlock(5);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("차단이 해제되었습니다.", response.getMessage());
        verify(friendRepository).delete(friend);
        verify(friendRepository).delete(friendReverse);
    }

    // ------------------ deleteFriend() 테스트 ------------------

    @Test
    public void testDeleteFriend() {
        // Arrange
        int friendId = 7;

        User sender = new User();
        sender.setUserId(10L);
        sender.setUserNickname("Alice");

        User friendUser = new User();
        friendUser.setUserId(20L);
        friendUser.setUserNickname("Bob");

        Friend friend = Friend.builder()
            .friendId(friendId)
            .user(sender)
            .friend(friendUser)
            .build();

        Friend friendReverse = Friend.builder()
            .friendId(8)
            .user(friendUser)
            .friend(sender)
            .build();

        when(friendRepository.findById(friendId)).thenReturn(Optional.of(friend));
        when(friendRepository.findByUser_UserIdAndFriend_UserId(friendUser.getUserId(),
            sender.getUserId()))
            .thenReturn(friendReverse);

        // Act
        ResponseDeleteFriend response = friendService.deleteFriend(friendId);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("삭제되었습니다.", response.getMessage());
        verify(friendRepository).delete(friend);
        verify(friendRepository).delete(friendReverse);
    }

    // ------------------ deleteFriendRequest() 테스트 ------------------

    @Test
    public void testDeleteFriendRequest() {
        // Arrange
        int friendId = 9;

        User sender = new User();
        sender.setUserId(10L);
        sender.setUserNickname("Alice");

        User friendUser = new User();
        friendUser.setUserId(20L);
        friendUser.setUserNickname("Bob");

        Friend friend = Friend.builder()
            .friendId(friendId)
            .user(sender)
            .friend(friendUser)
            .build();

        when(friendRepository.findById(friendId)).thenReturn(Optional.of(friend));

        // Act
        ResponseDeleteFriendRequest response = friendService.deleteFriendRequest(friendId);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("삭제되었습니다.", response.getMessage());
        verify(friendRepository).delete(friend);
    }

    // ------------------ sendMessage() 테스트 ------------------

    @Test
    public void testSendMessage() {
        // Arrange
        RequestSendFriendMessage request = new RequestSendFriendMessage();
        request.setUserId(10L);
        request.setSenderId(20L);
        request.setContent("Hello");

        User recipient = new User();
        recipient.setUserId(10L);
        recipient.setUserNickname("Alice");

        User sender = new User();
        sender.setUserId(20L);
        sender.setUserNickname("Bob");

        when(userRepository.findById(10L)).thenReturn(Optional.of(recipient));
        when(userRepository.findById(20L)).thenReturn(Optional.of(sender));
        when(friendMessageRepository.save(any(FriendMessage.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ResponseSendFriendMessage response = friendService.sendMessage(request);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("발송 성공", response.getMessage());
        verify(messagingTemplate).convertAndSend(eq("/topic/user/" + recipient.getUserId()),
            anyString());
    }

    // ------------------ deleteMesasge() 테스트 ------------------

    @Test
    public void testDeleteMessage() {
        // Arrange
        int friendMessageId = 11;
        FriendMessage friendMessage = new FriendMessage();
        friendMessage.setContent("Test message");
        friendMessage.setDeletedAt(null);

        when(friendMessageRepository.findById(friendMessageId)).thenReturn(
            Optional.of(friendMessage));
        when(friendMessageRepository.save(any(FriendMessage.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ResponseDeleteMessage response = friendService.deleteMesasge(friendMessageId);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("성공적으로 삭제되었습니다.", response.getMessage());
        assertNotNull(friendMessage.getDeletedAt());
    }

    // ------------------ getMessageList() 테스트 ------------------

    @Test
    public void testGetMessageList() {
        // Arrange
        long userId = 10L;
        FriendMessage message = new FriendMessage();
        message.setContent("Hi");
        // 필요한 다른 필드들이 있다면 설정 (예: createdAt 등)

        when(friendMessageRepository.findByUser_UserIdAndDeletedAtIsNull(userId))
            .thenReturn(Arrays.asList(message));

        // Act
        var result = friendService.getMessageList(userId);

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
    }

    // ------------------ searchUser() 테스트 ------------------

    // 성공 케이스
    @Test
    public void testSearchUser_Success() {
        // Arrange
        String nickname = "Alice";
        User user = new User();
        user.setUserId(10L);
        user.setUserNickname(nickname);

        when(userRepository.findByUserNickname(nickname)).thenReturn(user);

        // Act
        ResponseSearchUser response = friendService.searchUser(nickname);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("조회 성공", response.getMessage());
        assertEquals(10L, response.getUserId());
    }

    // 실패 케이스 (존재하지 않는 닉네임)
    @Test
    public void testSearchUser_Failure() {
        // Arrange
        String nickname = "NonExisting";
        // findByUserNickname() 호출 시 예외 발생하도록 설정
        when(userRepository.findByUserNickname(nickname)).thenThrow(
            new RuntimeException("User not found"));

        // Act
        ResponseSearchUser response = friendService.searchUser(nickname);

        // Assert
        // 코드상 catch 이후 기본값(500, "조회 실패")를 반환하도록 구현되어 있음
        assertNotNull(response);
        assertEquals(500, response.getCode());
        assertEquals("조회 실패", response.getMessage());
    }
}
