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
	private int owner;
	private int toll;
	private boolean hasBase;
	private TileType type;
	private int price;
	private String imageUrl;
}
