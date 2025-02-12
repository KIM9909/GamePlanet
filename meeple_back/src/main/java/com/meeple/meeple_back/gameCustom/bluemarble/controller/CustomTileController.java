package com.meeple.meeple_back.gameCustom.bluemarble.controller;

import com.meeple.meeple_back.game.bluemarble.domain.Tile;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomTileId;
import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomTileService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("/custom-element/tile")
@RequestMapping
@RequiredArgsConstructor
public class CustomTileController {
	// 특정 커스텀의 타일 정보를 조회, 생성, 업데이트, 삭제할 수 있따. 조회할 수 있다.
	// pk -> CustomId, TileId
	private final CustomTileService customTileService;

	// CREATE
	@PostMapping("/{customId}")
	public ResponseEntity<CustomTileResponse>  createCustomTile(@PathVariable Integer customId,
			@RequestBody CustomTileRequest request) {
		CustomTileResponse response= customTileService.create(request);
		return ResponseEntity.ok(response);
	}

	// READ ALL
	@GetMapping("/{customId}")
	public ResponseEntity<List<TileResponse>> getCustomTiles(@PathVariable Integer customId) {
		List<TileResponse> customTileResponses = customTileService.findAll(customId);
		return ResponseEntity.ok(customTileResponses);
	}

	// READ ONE
	@GetMapping("/{customId}/read/{tileId}")
	public ResponseEntity<CustomTileResponse> getCustomTile(@PathVariable Integer customId,
			@PathVariable Integer tileId) {
		CustomTileId id = new CustomTileId(customId, tileId);
		CustomTileResponse response= customTileService.findById(id);
		return ResponseEntity.ok(response);
	}

	// UPDATE
	@PutMapping("/{customId}/update/{tileId}")
	public ResponseEntity<CustomTileResponse> updateCustomTile(@PathVariable Integer customId,
			@PathVariable Integer tileId,
			@RequestBody CustomTileRequest request) {
		CustomTileId id = new CustomTileId(customId, tileId);
		CustomTileResponse response =  customTileService.update(id, request);

		return ResponseEntity.ok(response);
	}

	// DELETE
	@DeleteMapping("/{customId}/delete/{tileId}")
	public ResponseEntity<Void> deleteCustomTile(@PathVariable Integer customId,
			@PathVariable Integer tileId) {
		CustomTileId id = new CustomTileId(customId, tileId);
		customTileService.delete(id);
		return ResponseEntity.noContent().build();
	}

}
