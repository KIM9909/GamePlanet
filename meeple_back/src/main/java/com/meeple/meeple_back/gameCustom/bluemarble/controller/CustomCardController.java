package com.meeple.meeple_back.gameCustom.bluemarble.controller;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomNeuronValleyCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomSeedcardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTelepathyCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomCardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomNeuronValleyCardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomSeedcardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTelepathyCardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomCardId;
import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/custom-element/card")
@RequiredArgsConstructor
public class CustomCardController {
	// 특정 커스텀의 타일 정보를 조회, 생성, 업데이트, 삭제할 수 있따. 조회할 수 있다.
	// pk -> CustomId, TileId
	private final CustomCardService customCardService;

	// CREATE seedcard
	@PostMapping("/{customId}/create-seed-card")
	public ResponseEntity<CustomSeedcardResponse> createSeedCard(@PathVariable Integer customId,
	                                                             @RequestBody CustomSeedcardRequest request) {
		CustomSeedcardResponse response = customCardService.createSeedCard(customId, request);
		return ResponseEntity.ok(response);
	}

	// 텔레파시 카드 생성 API
	@PostMapping("/{customId}/create-telepathy-card")
	public ResponseEntity<CustomTelepathyCardResponse> createTelepathyCard(
			@PathVariable Integer customId,
			@RequestBody CustomTelepathyCardRequest request) {

		CustomTelepathyCardResponse response = customCardService.createTelepathyCard(customId, request);
		return ResponseEntity.ok(response);
	}

	// 뉴런의 골짜기 카드 생성 API
	@PostMapping("/{customId}/create-neuronvalley-card")
	public ResponseEntity<CustomNeuronValleyCardResponse> createNeuronValleyCard(
			@PathVariable Integer customId,
			@RequestBody CustomNeuronValleyCardRequest request) {

		CustomNeuronValleyCardResponse response = customCardService.createNeuronValleyCard(customId, request);
		return ResponseEntity.ok(response);
	}

	// READ ALL
	@GetMapping("/{customId}/read-all-seed-cards")
	public ResponseEntity<List<CustomSeedcardResponse>> getCustomTiles(@PathVariable Integer customId) {
		List<CustomSeedcardResponse> customTileResponses = customCardService.findAllSeedCard(customId);
		return ResponseEntity.ok(customTileResponses);
	}

	// READ ALL Telepathy Cards
	@GetMapping("/{customId}/read-all-telepathy-cards")
	public ResponseEntity<List<CustomTelepathyCardResponse>> getAllTelepathyCards(
			@PathVariable Integer customId) {
		List<CustomTelepathyCardResponse> telepathyCards = customCardService.findAllTelepathyCards(customId);
		return ResponseEntity.ok(telepathyCards);
	}

	// READ ALL Neuron Valley Cards
	@GetMapping("/{customId}/read-all-neuronvalley-cards")
	public ResponseEntity<List<CustomNeuronValleyCardResponse>> getAllNeuronValleyCards(
			@PathVariable Integer customId) {
		List<CustomNeuronValleyCardResponse> neuronValleyCards = customCardService.findAllNeuronValleyCards(customId);
		return ResponseEntity.ok(neuronValleyCards);
	}

	// READ ONE
	@GetMapping("/{customId}/read/{cardId}")
	public ResponseEntity<CustomCardResponse> findByCustomCardId(@PathVariable Integer customId,
	                                                             @PathVariable Integer cardId) {
		CustomCardId id = new CustomCardId(customId, cardId);
		CustomCardResponse response = customCardService.findById(id);
		return ResponseEntity.ok(response);
	}

	// UPDATE
	@PutMapping("/{customId}/update/{cardId}")
	public ResponseEntity<CustomCardResponse> updateCustomCard(@PathVariable Integer customId,
	                                                           @PathVariable Integer cardId,
	                                                           @RequestBody CustomCardRequest request) {
		CustomCardId id = new CustomCardId(customId, cardId);
		CustomCardResponse response = customCardService.update(id, request);
		return ResponseEntity.ok(response);
	}

	// DELETE
	@DeleteMapping("/{customId}/delete/{cardId}")
	public ResponseEntity<Void> deleteCustomTile(@PathVariable Integer customId,
	                                             @PathVariable Integer cardId) {
		CustomCardId id = new CustomCardId(customId, cardId);
		customCardService.delete(id);
		return ResponseEntity.noContent().build();
	}

}