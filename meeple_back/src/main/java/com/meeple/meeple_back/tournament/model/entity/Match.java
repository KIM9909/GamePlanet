package com.meeple.meeple_back.tournament.model.entity;

import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.user.model.User;
import jakarta.persistence.*;

@Entity
@Table(name = "tbl_match")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id")
    private long matchId;

    @Column(name = "match_result")
    private long matchResult;

    @Column(name = "match_round")
    private int matchRound;

    @ManyToOne
    @JoinColumn(name = "tournament_participant_id")
    private TournamentParticipant tournamentParticipant;

    @ManyToOne
    @JoinColumn(name = "tournament_participant_id_2")
    private TournamentParticipant tournamentParticipant2;

    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;
}
