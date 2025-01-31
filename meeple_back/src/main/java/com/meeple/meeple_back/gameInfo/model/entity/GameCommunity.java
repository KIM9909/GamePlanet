package com.meeple.meeple_back.gameInfo.model.entity;

import com.meeple.meeple_back.user.model.User;
import jakarta.persistence.*;

import java.sql.Date;

@Entity
@Table(name = "tbl_game_community")
public class GameCommunity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "game_community_id")
    private int gameCommunityId;

    @Column(name = "game_community_content")
    private String gameCommunityContent;

    @Column(name = "created_at")
    private Date createAt;

    @Column(name = "deleted_at")
    private Date deleted_at;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}
