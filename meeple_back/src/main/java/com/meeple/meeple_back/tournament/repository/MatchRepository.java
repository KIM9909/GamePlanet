package com.meeple.meeple_back.tournament.repository;

import com.meeple.meeple_back.tournament.model.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
}
