package com.meeple.meeple_back.tournament.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tbl_tournament_round")
public class TournamentRound {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tournament_round_id")
    private long tournamentRoundId;

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "match_id")
    private Match match;
}
