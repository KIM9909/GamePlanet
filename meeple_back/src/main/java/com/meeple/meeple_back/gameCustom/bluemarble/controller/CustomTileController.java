package com.meeple.meeple_back.gameCustom.bluemarble.controller;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomTileId;
import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomTileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/custom-element/tile")
@RequiredArgsConstructor
public class CustomTileController {
	private final CustomTileService customTileService;
	private final AmazonS3 amazonS3;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	// CREATE
	@PostMapping(value = "/{customId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> createCustomTile(@PathVariable Integer customId,
	                                          @RequestParam("tileName") String tileName, @RequestParam("tileColor") String tileColor, @RequestParam("tileNumber") Integer tileNumber, @RequestParam("tileType") String tileType, @RequestParam("tilePrice") Integer tilePrice, @RequestPart("tileImage") MultipartFile tileImage) {
		if (tileImage.isEmpty()) {
			return ResponseEntity.badRequest().body("파일이 전송되지 않았습니다.");
		}
		if (!"image/png".equals(tileImage.getContentType())) {
			return ResponseEntity.badRequest().body("PNG 이미지 형식만 지원합니다.");
		}
		try {
			String fileName = "custom-tile-" + System.currentTimeMillis() + ".png";

			ObjectMetadata metadata = new ObjectMetadata();
			metadata.setContentType(tileImage.getContentType());
			metadata.setContentLength(tileImage.getSize());

			amazonS3.putObject(bucketName, fileName, tileImage.getInputStream(), metadata);

			String fileUrl = amazonS3.getUrl(bucketName, fileName).toString();

			CustomTileResponse response = customTileService.create(CustomTileRequest.builder().customId(customId).tileName(tileName).tileNumber(tileNumber).tileType(tileType).tileImageUrl(fileUrl).tilePrice(tilePrice).build(), tileColor);
			return ResponseEntity.ok(response);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
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
		CustomTileResponse response = customTileService.findById(id);
		return ResponseEntity.ok(response);
	}

	// UPDATE
	@PutMapping("/{customId}/update/{tileId}")
	public ResponseEntity<CustomTileResponse> updateCustomTile(@PathVariable Integer customId,
	                                                           @PathVariable Integer tileId,
	                                                           @RequestBody CustomTileRequest request) {
		CustomTileId id = new CustomTileId(customId, tileId);
		CustomTileResponse response = customTileService.update(id, request);

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
