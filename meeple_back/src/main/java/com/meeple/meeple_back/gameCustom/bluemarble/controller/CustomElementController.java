package com.meeple.meeple_back.gameCustom.bluemarble.controller;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomElementRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTileCardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomElementService;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/custom-element")
@RequiredArgsConstructor
public class CustomElementController {
	private final CustomElementService customElementService;
	private final AmazonS3 amazonS3;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	@PostMapping("/create")
	public ResponseEntity<CustomElementResponse> create(@RequestBody CustomElementRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(customElementService.create(request));
	}

	@PostMapping(value = "/{customId}/create-tile-card", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> createTileAndCard(
		@RequestParam("cardColor") String cardColor,
		@RequestParam("name") String name,
		@RequestParam("seedCount") int seedCount,
		@RequestParam("description") String description,
		@RequestParam("baseConstructionCost") int baseConstructionCost,
		@RequestParam("headquartersUsageFee") int headquartersUsageFee,
		@RequestParam("baseUsageFee") int baseUsageFee,
		@RequestParam("imgFile") MultipartFile imgFile, @RequestParam("number") int number, @PathVariable("customId") int customId) {


		if (imgFile.isEmpty()) {
			return ResponseEntity.badRequest().body("파일이 전송되지 않았습니다.");
		}
		if (!"image/png".equals(imgFile.getContentType())) {
			return ResponseEntity.badRequest().body("PNG 이미지 형식만 지원합니다.");
		}
		try {
			String fileName = "custom-tile-card-" + System.currentTimeMillis() + ".png";

			ObjectMetadata metadata = new ObjectMetadata();
			metadata.setContentType(imgFile.getContentType());
			metadata.setContentLength(imgFile.getSize());

			amazonS3.putObject(bucketName, fileName, imgFile.getInputStream(), metadata);

			String fileUrl = amazonS3.getUrl(bucketName, fileName).toString();

			CustomTileCardRequest request = CustomTileCardRequest.builder()
				.cardColor(cardColor)
				.name(name)
				.seedCount(seedCount)
				.description(description)
				.baseConstructionCost(baseConstructionCost)
				.headquartersUsageFee(headquartersUsageFee)
				.baseUsageFee(baseUsageFee)
				.imageUrl(fileUrl)
				.number(number)
				.build();
			CustomTileCardResponse response = customElementService.createTileAndCard(customId, request);
			return ResponseEntity.ok(response);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
	// READ ALL
	@GetMapping
	public ResponseEntity<List<CustomElementResponse>> getAllCustomElements() {
		return ResponseEntity.status(HttpStatus.OK).body(customElementService.findAll());
	}

	// READ ONE
	@GetMapping("/{customId}")
	public ResponseEntity<CustomElementResponse> getCustomElementById(@PathVariable Integer customId) {
		return ResponseEntity.status(HttpStatus.OK).body(customElementService.findById(customId));
	}

	// UPDATE
	@PutMapping("/{customId}/update")
	public ResponseEntity<CustomElementResponse> updateCustomElement(@PathVariable Integer customId, @RequestBody CustomElementRequest request) {
		return ResponseEntity.status(HttpStatus.OK).body(customElementService.update(customId, request));

	}

	// DELETE
	@DeleteMapping("/{customId}/delete")
	public ResponseEntity<Void> deleteCustomElement(@PathVariable Integer customId) {
		customElementService.delete(customId);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
}
