package com.meeple.meeple_back.game.bluemarble.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Builder;
import lombok.Getter;


@Builder
@Getter
public class GamePlayCreate {

	private int gamePlayId;
	@NotNull
	private List<Player> players;

	@JsonCreator
	@Builder
	public GamePlayCreate(@JsonProperty("gamePlayId") int gamePlayId,
			@JsonProperty("players") List<Player> players) {
		this.gamePlayId = gamePlayId;
		this.players = players;
	}
}
