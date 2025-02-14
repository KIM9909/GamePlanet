package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class CustomTileCardResponse {
    private TileResponse tile;
    private CardResponse card;
}
