package com.meeple.meeple_back.game.bluemarble.domain;

import com.meeple.meeple_back.user.model.User;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

	private int playerId;
	private String playerName;
	private int position;
	private int balance;
	private Set<String> seedCertificateCardOwned;

	public Player(User user) {
		final int INITIAL_BALANCE = 0;
		final int INITIAL_POSITION = 0;
		this.playerId = Math.toIntExact(user.getUserId());
		this.playerName = user.getUserName();
		this.position = INITIAL_POSITION;
		this.balance = INITIAL_BALANCE;
		this.seedCertificateCardOwned = new HashSet<>();
	}

	public static Player init(User user) {
		return Player.builder()
				.playerId(Math.toIntExact(user.getUserId()))
				.playerName(user.getUserName())
				.position(0)
				.balance(0)
				.seedCertificateCardOwned(new HashSet<>())
				.build();
	}
}