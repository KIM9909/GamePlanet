package com.meeple.meeple_back.gameInfo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameReviewRepository extends JpaRepository<GameReviewRepository, Integer> {
}
