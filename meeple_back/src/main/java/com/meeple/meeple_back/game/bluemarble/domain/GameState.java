package com.meeple.meeple_back.game.bluemarble.domain;

import java.util.Map;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameState {

	private int currentPlayerId;
	private Map<Integer, Player> players;
	private Set<SeedCertificateCard> seedCertificateCards;
	private String gameStatus;
}
