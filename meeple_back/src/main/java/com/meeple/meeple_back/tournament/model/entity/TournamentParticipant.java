package com.meeple.meeple_back.tournament.model.entity;

import com.meeple.meeple_back.user.model.User;
import jakarta.persistence.*;

@Entity
@Table(name = "tbl_tournament_participant")
public class TournamentParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tournament_participant_id")
    private long tournamentParticipantId;

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
