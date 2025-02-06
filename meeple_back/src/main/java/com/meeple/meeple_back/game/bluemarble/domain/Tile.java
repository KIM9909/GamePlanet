package com.meeple.meeple_back.game.bluemarble.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Tile {

	private int id;
	private String name;
	private int ownerId;
	private int tollPrice;
	private boolean hasBase;
	private TileType type;
	private String imageUrl;
}
