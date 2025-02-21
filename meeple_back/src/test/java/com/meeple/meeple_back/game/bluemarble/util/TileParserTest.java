package com.meeple.meeple_back.game.bluemarble.util;

import com.meeple.meeple_back.game.bluemarble.domain.Tile;
import java.util.List;
import org.junit.jupiter.api.Test;

class TileParserTest {

	@Test
	void readExcelFile() {
		TileParser parser = new TileParser();
		List<Tile> tiles = parser.readExcelFile();
		System.out.println(tiles);

	}
}