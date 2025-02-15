package com.meeple.meeple_back.gameInfo.repo;

import com.meeple.meeple_back.gameInfo.model.entity.GameCommunityComment;
import com.meeple.meeple_back.gameInfo.model.entity.GameCommunity;
import com.meeple.meeple_back.gameInfo.repository.GameCommunityCommentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = Replace.NONE)
public class GameCommunityCommentRepoTest {

    @Autowired
    private GameCommunityCommentRepository gameCommunityCommentRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void testFindByGameCommunity_GameCommunityIdAndDeletedAtIsNull() {
        // given: GameCommunity 엔티티 생성 (ID는 자동 생성)
        GameCommunity community = new GameCommunity();
        // ID를 수동으로 설정하지 않습니다.
        entityManager.persist(community);

        // given: 삭제되지 않은 댓글 생성
        GameCommunityComment comment1 = new GameCommunityComment();
        comment1.setGameCommunity(community);
        comment1.setDeletedAt(null);
        entityManager.persist(comment1);

        // given: 삭제된 댓글 생성
        GameCommunityComment comment2 = new GameCommunityComment();
        comment2.setGameCommunity(community);
        comment2.setDeletedAt(LocalDateTime.now());
        entityManager.persist(comment2);

        entityManager.flush();

        // when: 댓글 검색
        // community의 ID는 자동으로 할당된 값을 사용합니다.
        List<GameCommunityComment> comments = gameCommunityCommentRepository.findByGameCommunity_GameCommunityIdAndDeletedAtIsNull(community.getGameCommunityId());

        // then: 삭제되지 않은 댓글만 조회되어야 함
        assertThat(comments).hasSize(1);
        assertThat(comments.get(0).getDeletedAt()).isNull();
    }

}

