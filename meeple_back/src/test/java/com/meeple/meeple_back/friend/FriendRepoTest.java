package com.meeple.meeple_back.friend;

import static org.assertj.core.api.Assertions.assertThat;

import com.meeple.meeple_back.friend.model.FriendStatus;
import com.meeple.meeple_back.friend.model.entity.Friend;
import com.meeple.meeple_back.friend.repository.FriendRepository;
import com.meeple.meeple_back.user.model.User;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE) // 기본 데이터베이스(H2 등)를 사용
@ActiveProfiles("test")
public class FriendRepoTest {
    @Autowired
    private FriendRepository friendRepository;

    @Autowired
    private TestEntityManager entityManager;

    /**
     * 테스트용 User 생성 후 DB에 persist.
     */
    private User createUser(String nickname) {
        User user = new User();
        user.setUserNickname(nickname);
        return entityManager.persistAndFlush(user);
    }

    /**
     * 테스트용 Friend 생성 후 DB에 persist.
     */
    private Friend createFriend(User user, User friendUser, FriendStatus status) {
        Friend friend = Friend.builder()
            .user(user)
            .friend(friendUser)
            .friendStatus(status)
            .build();
        return entityManager.persistAndFlush(friend);
    }

    // ------------------ Repository 메서드 테스트 ------------------

    @Test
    public void testFindByUser_UserId() {
        // given
        User user = createUser("User1");
        User friendUser = createUser("Friend1");
        createFriend(user, friendUser, FriendStatus.ACCEPTED);

        // when
        List<Friend> result = friendRepository.findByUser_UserId(user.getUserId());

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFriendStatus()).isEqualTo(FriendStatus.ACCEPTED);
    }

    @Test
    public void testExistsByUserAndFriend() {
        // given
        User user = createUser("User2");
        User friendUser = createUser("Friend2");
        createFriend(user, friendUser, FriendStatus.PENDING);

        // when
        boolean exists = friendRepository.existsByUserAndFriend(user, friendUser);

        // then
        assertThat(exists).isTrue();

        // 없는 경우 테스트
        User anotherUser = createUser("AnotherUser");
        boolean notExists = friendRepository.existsByUserAndFriend(user, anotherUser);
        assertThat(notExists).isFalse();
    }

    @Test
    public void testFindByUser_UserIdAndFriendStatus() {
        // given
        User user = createUser("User3");
        User friendUser1 = createUser("Friend3_1");
        User friendUser2 = createUser("Friend3_2");

        createFriend(user, friendUser1, FriendStatus.PENDING);
        createFriend(user, friendUser2, FriendStatus.ACCEPTED);

        // when: PENDING 상태 조회
        List<Friend> pendingFriends = friendRepository.findByUser_UserIdAndFriendStatus(user.getUserId(), FriendStatus.PENDING);
        // then
        assertThat(pendingFriends).hasSize(1);
        assertThat(pendingFriends.get(0).getFriendStatus()).isEqualTo(FriendStatus.PENDING);

        // when: ACCEPTED 상태 조회
        List<Friend> acceptedFriends = friendRepository.findByUser_UserIdAndFriendStatus(user.getUserId(), FriendStatus.ACCEPTED);
        // then
        assertThat(acceptedFriends).hasSize(1);
        assertThat(acceptedFriends.get(0).getFriendStatus()).isEqualTo(FriendStatus.ACCEPTED);
    }

    @Test
    public void testFindByFriend_UserIdAndFriendStatus() {
        // given
        User friendUser = createUser("User4"); // 친구 요청을 받은 대상
        User requester1 = createUser("User4_1");
        User requester2 = createUser("User4_2");

        createFriend(requester1, friendUser, FriendStatus.PENDING);
        createFriend(requester2, friendUser, FriendStatus.ACCEPTED);

        // when: PENDING 상태 조회 (요청 받은 목록)
        List<Friend> pendingRequests = friendRepository.findByFriend_UserIdAndFriendStatus(friendUser.getUserId(), FriendStatus.PENDING);
        // then
        assertThat(pendingRequests).hasSize(1);
        assertThat(pendingRequests.get(0).getFriendStatus()).isEqualTo(FriendStatus.PENDING);

        // when: ACCEPTED 상태 조회
        List<Friend> acceptedRequests = friendRepository.findByFriend_UserIdAndFriendStatus(friendUser.getUserId(), FriendStatus.ACCEPTED);
        // then
        assertThat(acceptedRequests).hasSize(1);
        assertThat(acceptedRequests.get(0).getFriendStatus()).isEqualTo(FriendStatus.ACCEPTED);
    }

    @Test
    public void testFindByUser_UserIdAndFriend_UserId() {
        // given
        User user = createUser("User5");
        User friendUser = createUser("Friend5");
        createFriend(user, friendUser, FriendStatus.ACCEPTED);

        // when
        Friend foundFriend = friendRepository.findByUser_UserIdAndFriend_UserId(user.getUserId(), friendUser.getUserId());

        // then
        assertThat(foundFriend).isNotNull();
        assertThat(foundFriend.getUser().getUserId()).isEqualTo(user.getUserId());
        assertThat(foundFriend.getFriend().getUserId()).isEqualTo(friendUser.getUserId());
    }
}
