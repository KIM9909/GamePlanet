package com.meeple.meeple_back.gameInfo.repo;

import com.meeple.meeple_back.gameInfo.model.entity.GameCommunity;
import com.meeple.meeple_back.gameInfo.model.entity.GameInfo;
import com.meeple.meeple_back.gameInfo.repository.GameCommunityRepository;
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
public class GameCommunityRepoTest {

    @Autowired
    private GameCommunityRepository gameCommunityRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void testFindByGameInfo_GameInfoIdAndDeletedAtIsNull() {
        // given: GameInfo 엔티티 생성 (ID 자동 생성)
        GameInfo gameInfo = new GameInfo();
        entityManager.persist(gameInfo);

        // given: 삭제되지 않은 커뮤니티 글 생성
        GameCommunity community1 = new GameCommunity();
        community1.setGameInfo(gameInfo);
        community1.setDeletedAt(null);
        entityManager.persist(community1);

        // given: 삭제된 커뮤니티 글 생성
        GameCommunity community2 = new GameCommunity();
        community2.setGameInfo(gameInfo);
        community2.setDeletedAt(LocalDateTime.now());
        entityManager.persist(community2);

        entityManager.flush();

        // when: 자동 생성된 gameInfo의 ID를 사용하여 검색
        List<GameCommunity> result = gameCommunityRepository.findByGameInfo_GameInfoIdAndDeletedAtIsNull(gameInfo.getGameInfoId());

        // then: 삭제되지 않은 커뮤니티 글만 조회되어야 함
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDeletedAt()).isNull();
    }
}
