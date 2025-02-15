package com.meeple.meeple_back.gameCustom.bluemarble.controller;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.util.IOUtils;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomElementRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.TileImageRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementListResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTileCardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileImageResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.domain.CustomElementUpdate;
import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomElementService;
import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
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

	// TODO 썸네일 이미지 갖도록 설정.
	//private String customName;
	//	private Long userId;
	@PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> create(@RequestParam("customName") String customName, @RequestParam("userId") Long userId, @RequestParam("imgFile") MultipartFile imgFile) {
		if (imgFile.isEmpty()) {
			return ResponseEntity.badRequest().body("파일이 전송되지 않았습니다.");
		}
		if (!"image/png".equals(imgFile.getContentType())) {
			return ResponseEntity.badRequest().body("PNG 이미지 형식만 지원합니다.");
		}
		try {
			String fileName = "custom-element-thumbnail" + System.currentTimeMillis() + ".png";

			ObjectMetadata metadata = new ObjectMetadata();
			metadata.setContentType(imgFile.getContentType());
			metadata.setContentLength(imgFile.getSize());

			amazonS3.putObject(bucketName, fileName, imgFile.getInputStream(), metadata);

			String fileUrl = amazonS3.getUrl(bucketName, fileName).toString();


			customElementService.create(customName, userId, fileUrl);
			return ResponseEntity.status(HttpStatus.CREATED).build();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}

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

	@PutMapping(value = "/{customId}/update-tile-card", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> updateTileAndCard(
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
			String existingFileUrl = customElementService.getExistingImageUrl(customId, number);
			String fileUrl;

			if (existingFileUrl != null) {
				// 기존 이미지와 새 이미지가 동일한지 비교
				String existingKey = extractKeyFromUrl(existingFileUrl);
				S3Object existingObject = amazonS3.getObject(bucketName, existingKey);
				byte[] existingBytes = IOUtils.toByteArray(existingObject.getObjectContent());
				byte[] newBytes = imgFile.getBytes();

				if (!Arrays.equals(existingBytes, newBytes)) {

					amazonS3.deleteObject(bucketName, existingKey);

					fileUrl = uploadNewImage(imgFile);
				} else {

					fileUrl = existingFileUrl;
				}
			} else {
				// 기존 이미지가 없으면 새 이미지 업로드
				fileUrl = uploadNewImage(imgFile);
			}

			// 요청 DTO 생성 후 서비스 호출
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
			CustomTileCardResponse response = customElementService.updateTileAndCard(customId, request);
			return ResponseEntity.ok(response);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	// TODO : 완료된 타일을 배열로 받기
	@GetMapping(value = "/{customId}/complete-tiles")
	public ResponseEntity<CustomElementListResponse> getCompleteCustoms(@PathVariable("customId") Integer customId){
		CustomElementListResponse response = customElementService.findCompleteElementList(customId);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{customId}/find-tile-card/{cardNumber}")
	public ResponseEntity<CustomTileCardResponse> findByCustomIdAndCardNumber(@PathVariable("customId") int customId, @PathVariable("cardNumber") int cardNumber){
		CustomTileCardResponse response = customElementService.findByCustomIdAndCardNumber(customId, cardNumber);
		return ResponseEntity.ok(response);
	}

	// 타일 이미지 미리보기 기능
	@GetMapping("/{customId}/tile-images")
	public ResponseEntity<List<TileImageResponse>> findTileImageUrls(@PathVariable Integer customId){
		// customID에 해당하는 타일의 번호에 해당하는 이미지 목록을 반환한다.
		List<TileImageResponse> tileImageResponses = customElementService.findTileImageUrlByCustomId(customId);
		return ResponseEntity.ok(tileImageResponses);
	}
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
	public ResponseEntity<CustomElementResponse> updateCustomElement(@PathVariable Integer customId, @RequestBody
	CustomElementUpdate request) {
		return ResponseEntity.status(HttpStatus.OK).body(customElementService.update(customId, request));

	}

	// DELETE
	@DeleteMapping("/{customId}/delete")
	public ResponseEntity<Void> deleteCustomElement(@PathVariable Integer customId) {
		customElementService.delete(customId);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	/**
	 * 새 이미지 업로드 후 S3 URL 반환
	 */
	private String uploadNewImage(MultipartFile imgFile) throws IOException {
		String fileName = "custom-tile-card-" + System.currentTimeMillis() + ".png";
		ObjectMetadata metadata = new ObjectMetadata();
		metadata.setContentType(imgFile.getContentType());
		metadata.setContentLength(imgFile.getSize());
		amazonS3.putObject(bucketName, fileName, imgFile.getInputStream(), metadata);
		return amazonS3.getUrl(bucketName, fileName).toString();
	}

	/**
	 * S3 URL에서 key(파일명)를 추출하는 유틸 메서드
	 * (예: https://bucket-name.s3.amazonaws.com/custom-tile-card-123456789.png)
	 */
	private String extractKeyFromUrl(String fileUrl) {
		// URL의 path 부분에서 '/' 제거 후 반환
		// URL 형식에 따라 적절히 구현 필요
		URI uri = URI.create(fileUrl);
		return uri.getPath().substring(1);
	}
}
