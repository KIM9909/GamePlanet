package com.meeple.meeple_back.gameInfo.repository;

import com.meeple.meeple_back.gameInfo.model.entity.GameCommunityComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameCommunityCommentRepository extends JpaRepository<GameCommunityComment, Integer> {
}
