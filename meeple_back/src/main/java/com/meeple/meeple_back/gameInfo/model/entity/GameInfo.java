package com.meeple.meeple_back.gameInfo.model.entity;

import com.meeple.meeple_back.game.game.model.Game;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tbl_game_info")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class GameInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "game_info_id")
    private int gameInfoId;

    @Column(name = "game_info_content")
    private String gameInfoContent;

    @Column(name = "game_rule")
    private String gameRule;

    @OneToOne
    @JoinColumn(name = "game_id")
    Game game;

}
