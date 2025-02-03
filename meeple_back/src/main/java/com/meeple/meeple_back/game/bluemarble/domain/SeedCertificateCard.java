package com.meeple.meeple_back.game.bluemarble.domain;

import lombok.Getter;

@Getter
public final class SeedCertificateCard extends Card {


	private final String cardColor;
	private final int seedCount;
	private final String description;
	private final int baseConstructionCost;

	private final int headquartersUsageFee;
	private final int baseUsageFee;

	public SeedCertificateCard(int id, String name, String cardColor, int seedCount,
			String description,
			int baseConstructionCost, int headquartersUsageFee, int baseUsageFee) {
		super(id, name);
		this.cardColor = cardColor;
		this.seedCount = seedCount;
		this.description = description;
		this.baseConstructionCost = baseConstructionCost;
		this.headquartersUsageFee = headquartersUsageFee;
		this.baseUsageFee = baseUsageFee;
	}
}
