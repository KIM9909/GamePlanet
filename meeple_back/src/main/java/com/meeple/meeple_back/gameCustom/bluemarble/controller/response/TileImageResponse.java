package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TileImageResponse {
	private int tileNumber;
	private String tileImageUrl;
}
