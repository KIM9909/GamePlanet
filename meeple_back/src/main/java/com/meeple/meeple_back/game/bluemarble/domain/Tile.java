package com.meeple.meeple_back.game.bluemarble.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tile {

	private int id;
	private String name;
	private int ownerId;
	private int tollPrice;
	private boolean hasBase;
	private TileType type;
	private String imageUrl;
	private int price;


	public Tile update(int ownerId, int tollPrice,
			int price) {
		return Tile.builder()
				.id(this.id)
				.name(this.name)
				.ownerId(ownerId)
				.tollPrice(tollPrice)
				.hasBase(this.hasBase)
				.type(this.type)
				.imageUrl(this.imageUrl)
				.price(price)
				.build();
	}

	public void addBase() {
		this.hasBase = true;
	}

	public void increateTollPrice(int priceToIncrease) {
		this.price += priceToIncrease;
	}
}
