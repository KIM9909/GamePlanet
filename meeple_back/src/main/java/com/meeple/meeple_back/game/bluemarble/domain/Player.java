package com.meeple.meeple_back.game.bluemarble.domain;

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
	private int position;
	private int balance;
	private Set<String> seedCertificateCardOwned;

	public Player(int userId) {
		final int INITIAL_BALANCE = 0;
		final int INITIAL_POSITION = 0;
		this.playerId = userId;
		this.position = INITIAL_POSITION;
		this.balance = INITIAL_BALANCE;
		this.seedCertificateCardOwned = new HashSet<>();
	}
}