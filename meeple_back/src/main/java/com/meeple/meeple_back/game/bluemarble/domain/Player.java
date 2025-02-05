package com.meeple.meeple_back.game.bluemarble.domain;

import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import com.meeple.meeple_back.user.model.User;
import java.util.HashSet;
import java.util.List;
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
	private Set<Card> seedCertificateCardOwned;
	private List<Integer> landOwned;

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

	public DiceRollResponse rollDices(DiceRollRequest diceRollRequest) {
		int sum = diceRollRequest.getFirstDice() + diceRollRequest.getSecondDice();
		int prevPosition = this.position;
		int nextPosition = (this.position + sum) % 40;
		if (this.position + sum >= 40) {
			this.balance += 200;
		}
		this.position = nextPosition;
		return new DiceRollResponse(prevPosition, nextPosition);
	}
}