package com.meeple.meeple_back.gameInfo.repo;

import com.meeple.meeple_back.gameInfo.model.entity.GameReview;
import com.meeple.meeple_back.gameInfo.model.entity.GameInfo;
import com.meeple.meeple_back.gameInfo.repository.GameReviewRepository;
import com.meeple.meeple_back.user.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = Replace.NONE)
public class GameReviewRepoTest {

    @Autowired
    private GameReviewRepository gameReviewRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void testFindByGameInfo_GameInfoId() {
        // given: GameInfo 엔티티 생성 (ID는 자동 생성)
        GameInfo gameInfo = new GameInfo();
        entityManager.persist(gameInfo);

        // given: 두 개의 리뷰 생성
        GameReview review1 = new GameReview();
        review1.setGameInfo(gameInfo);
        entityManager.persist(review1);

        GameReview review2 = new GameReview();
        review2.setGameInfo(gameInfo);
        entityManager.persist(review2);

        entityManager.flush();

        // when: gameInfo에 할당된 자동 생성 ID로 리뷰 검색
        int generatedGameInfoId = gameInfo.getGameInfoId();
        List<GameReview> reviews = gameReviewRepository.findByGameInfo_GameInfoId(generatedGameInfoId);

        // then: 2개의 리뷰가 조회되어야 함
        assertThat(reviews).hasSize(2);
    }

    @Test
    void testExistsByUser_UserId() {
        // given: User 엔티티 생성 (ID는 자동 생성)
        User user = new User();
        entityManager.persist(user);

        // given: GameInfo 엔티티 생성
        GameInfo gameInfo = new GameInfo();
        entityManager.persist(gameInfo);

        // given: 리뷰 생성 및 User 연결
        GameReview review = new GameReview();
        review.setGameInfo(gameInfo);
        review.setUser(user);
        entityManager.persist(review);

        entityManager.flush();

        // when: user에 할당된 자동 생성 ID를 사용하여 존재 여부 확인
        long generatedUserId = user.getUserId();
        boolean exists = gameReviewRepository.existsByUser_UserId(generatedUserId);
        // when: 존재하지 않는 userId (예: 999L) 확인
        boolean notExists = gameReviewRepository.existsByUser_UserId(999L);

        // then:
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }
}
