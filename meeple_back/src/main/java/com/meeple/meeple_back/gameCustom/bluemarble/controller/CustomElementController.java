package com.meeple.meeple_back.gameCustom.bluemarble.controller;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.util.IOUtils;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementListResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTileCardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileImageResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.domain.CustomElementUpdate;
import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomElementService;
import io.swagger.v3.oas.annotations.Operation;
import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * CustomElementController는 커스텀 요소와 관련된 API 엔드포인트를 제공하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/custom-element")
@RequiredArgsConstructor
public class CustomElementController {

	private final CustomElementService customElementService;
	private final AmazonS3 amazonS3;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	/**
	 * 특정 customId와 userId에 해당하는 CustomElement 목록을 조회하는 엔드포인트입니다.
	 *
	 * @param customId 조회할 커스텀 요소의 ID
	 * @param userId   조회할 사용자의 ID
	 * @return 조회된 CustomElementResponse 객체 목록을 포함한 ResponseEntity
	 */
	@Operation(tags = "customElement 목록중 입력받은 userId가 현재 접속한 유저의 것을 찾는다.")
	@GetMapping("/{customId}/find-by-user-id/{userId}")
	public ResponseEntity<List<CustomElementResponse>> findByUserId(
			@PathVariable(name = "customId") Integer customId,
			@PathVariable("userId") Long userId) {
		List<CustomElementResponse> response = customElementService.findByUserId(customId, userId);
		return ResponseEntity.ok(response);
	}

	/**
	 * 새로운 커스텀 요소를 생성하는 엔드포인트입니다.
	 *
	 * @param customName 생성할 커스텀 요소의 이름
	 * @param userId     생성할 사용자의 ID
	 * @param imgFile    업로드할 이미지 파일 (PNG 형식만 지원)
	 * @return 생성된 CustomElementResponse 객체를 포함한 ResponseEntity
	 */
	@PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> create(@RequestParam("customName") String customName,
			@RequestParam("userId") Long userId, @RequestParam("imgFile") MultipartFile imgFile) {
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

			CustomElementResponse response = customElementService.create(customName, userId,
					fileUrl);
			return ResponseEntity.status(HttpStatus.CREATED).body(response);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * 새로운 타일 카드와 이미지를 생성하는 엔드포인트입니다.
	 *
	 * @param cardColor            생성할 카드의 색상
	 * @param name                 생성할 타일 카드의 이름
	 * @param seedCount            생성할 타일 카드의 씨앗 수
	 * @param description          생성할 타일 카드의 설명
	 * @param baseConstructionCost 생성할 타일 카드의 기본 건설 비용
	 * @param headquartersUsageFee 생성할 타일 카드의 본사 사용료
	 * @param baseUsageFee         생성할 타일 카드의 기본 사용료
	 * @param imgFile              업로드할 이미지 파일 (PNG 형식만 지원)
	 * @param number               생성할 타일 카드의 번호
	 * @param customId             생성할 커스텀 요소의 ID
	 * @return 생성된 CustomTileCardResponse 객체를 포함한 ResponseEntity
	 */
	@PostMapping(value = "/{customId}/create-tile-card", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> createTileAndCard(
			@RequestParam("cardColor") String cardColor,
			@RequestParam("name") String name,
			@RequestParam("seedCount") int seedCount,
			@RequestParam("description") String description,
			@RequestParam("baseConstructionCost") int baseConstructionCost,
			@RequestParam("headquartersUsageFee") int headquartersUsageFee,
			@RequestParam("baseUsageFee") int baseUsageFee,
			@RequestParam("imgFile") MultipartFile imgFile, @RequestParam("number") int number,
			@PathVariable("customId") int customId) {

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
			CustomTileCardResponse response = customElementService.createTileAndCard(customId,
					request);
			return ResponseEntity.ok(response);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * 특정 customId와 number에 해당하는 타일 카드와 이미지를 업데이트하는 엔드포인트입니다.
	 *
	 * @param cardColor            업데이트할 카드의 색상
	 * @param name                 업데이트할 타일 카드의 이름
	 * @param seedCount            업데이트할 타일 카드의 씨앗 수
	 * @param description          업데이트할 타일 카드의 설명
	 * @param baseConstructionCost 업데이트할 타일 카드의 기본 건설 비용
	 * @param headquartersUsageFee 업데이트할 타일 카드의 본사 사용료
	 * @param baseUsageFee         업데이트할 타일 카드의 기본 사용료
	 * @param imgFile              업로드할 이미지 파일 (PNG 형식만 지원)
	 * @param number               업데이트할 타일 카드의 번호
	 * @param customId             업데이트할 커스텀 요소의 ID
	 * @return 업데이트된 CustomTileCardResponse 객체를 포함한 ResponseEntity
	 */
	@PutMapping(value = "/{customId}/update-tile-card", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> updateTileAndCard(
			@RequestParam("cardColor") String cardColor,
			@RequestParam("name") String name,
			@RequestParam("seedCount") int seedCount,
			@RequestParam("description") String description,
			@RequestParam("baseConstructionCost") int baseConstructionCost,
			@RequestParam("headquartersUsageFee") int headquartersUsageFee,
			@RequestParam("baseUsageFee") int baseUsageFee,
			@RequestParam("imgFile") MultipartFile imgFile, @RequestParam("number") int number,
			@PathVariable("customId") int customId) {

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
			CustomTileCardResponse response = customElementService.updateTileAndCard(customId,
					request);
			return ResponseEntity.ok(response);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * 사용자가 완료한 커스텀 요소 목록을 조회하는 엔드포인트입니다.
	 *
	 * @param customId 조회할 커스텀 요소의 ID
	 * @return 완료된 커스텀 요소 목록을 포함한 ResponseEntity 객체
	 */
	@GetMapping(value = "/{customId}/complete-tiles")
	public ResponseEntity<CustomElementListResponse> getCompleteCustoms(
			@PathVariable("customId") Integer customId) {
		CustomElementListResponse response = customElementService.findCompleteElementList(customId);
		return ResponseEntity.ok(response);
	}

	/**
	 * 특정 customId와 cardNumber에 해당하는 CustomTileCard를 조회하는 엔드포인트입니다.
	 *
	 * @param customId   조회할 커스텀 요소의 ID
	 * @param cardNumber 조회할 카드의 번호
	 * @return 조회된 CustomTileCardResponse 객체를 포함한 ResponseEntity
	 */
	@GetMapping("/{customId}/find-tile-card/{cardNumber}")
	public ResponseEntity<CustomTileCardResponse> findByCustomIdAndCardNumber(
			@PathVariable("customId") int customId, @PathVariable("cardNumber") int cardNumber) {
		CustomTileCardResponse response = customElementService.findByCustomIdAndCardNumber(customId,
				cardNumber);
		return ResponseEntity.ok(response);
	}

	/**
	 * 특정 customId에 해당하는 타일 이미지 URL 목록을 조회하는 엔드포인트입니다.
	 *
	 * @param customId 조회할 커스텀 요소의 ID
	 * @return 타일 이미지 URL 목록을 포함한 ResponseEntity 객체
	 */
	@GetMapping("/{customId}/tile-images")
	public ResponseEntity<List<TileImageResponse>> findTileImageUrls(
			@PathVariable Integer customId) {
		List<TileImageResponse> tileImageResponses = customElementService.findTileImageUrlByCustomId(
				customId);
		return ResponseEntity.ok(tileImageResponses);
	}

	@GetMapping
	public ResponseEntity<List<CustomElementResponse>> getAllCustomElements() {
		return ResponseEntity.status(HttpStatus.OK).body(customElementService.findAll());
	}

	@GetMapping("/{customId}")
	public ResponseEntity<CustomElementResponse> getCustomElementById(
			@PathVariable Integer customId) {
		return ResponseEntity.status(HttpStatus.OK).body(customElementService.findById(customId));
	}

	@PutMapping("/{customId}/update")
	public ResponseEntity<CustomElementResponse> updateCustomElement(@PathVariable Integer customId,
			@RequestBody
			CustomElementUpdate request) {
		return ResponseEntity.status(HttpStatus.OK)
				.body(customElementService.update(customId, request));

	}

	/**
	 * 특정 customId에 해당하는 커스텀 요소를 삭제하는 엔드포인트입니다.
	 *
	 * @param customId 삭제할 커스텀 요소의 ID
	 * @return HTTP 상태 코드 204 (No Content)
	 */
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
	 * S3 URL에서 key(파일명)를 추출하는 유틸 메서드 (예:
	 * https://bucket-name.s3.amazonaws.com/custom-tile-card-123456789.png)
	 */
	private String extractKeyFromUrl(String fileUrl) {
		// URL의 path 부분에서 '/' 제거 후 반환
		// URL 형식에 따라 적절히 구현 필요
		URI uri = URI.create(fileUrl);
		return uri.getPath().substring(1);
	}
}
