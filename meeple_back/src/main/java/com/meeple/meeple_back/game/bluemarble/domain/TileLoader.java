package com.meeple.meeple_back.game.bluemarble.domain;

import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomTileService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TileLoader implements LoadGameElement<Tile> {

	@Autowired
	private CustomTileService customTileService;

	@Override
	public List<Tile> load(Integer customId) {
		List<Tile> customtiles = customTileService.findTilesByCustomId(customId);
		return customtiles;
	}
}
