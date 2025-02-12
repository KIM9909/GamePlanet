package com.meeple.meeple_back.gameCustom.bluemarble.controller;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomElementRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.domain.CustomElementCreate;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomElementService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/custom-element")
@RequiredArgsConstructor
public class CustomElementController {
	private final CustomElementService customElementService;

	@PostMapping("/create")
	public ResponseEntity<CustomElementResponse>  create(@RequestBody CustomElementRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(customElementService.create(request)) ;
	}

	// READ ALL
	@GetMapping
	public ResponseEntity<List<CustomElementResponse>> getAllCustomElements() {
		return ResponseEntity.status(HttpStatus.OK).body(customElementService.findAll());
	}

	// READ ONE
	@GetMapping("/{customId}")
	public ResponseEntity<CustomElementResponse> getCustomElementById(@PathVariable Integer customId) {
		return ResponseEntity.status(HttpStatus.OK).body(customElementService.findById(customId)) ;
	}

	// UPDATE
	@PutMapping("/{customId}/update")
	public ResponseEntity<CustomElementResponse> updateCustomElement(@PathVariable Integer customId, @RequestBody CustomElementRequest request) {
		return ResponseEntity.status(HttpStatus.OK).body( customElementService.update(customId, request));

	}

	// DELETE
	@DeleteMapping("/{customId}/delete")
	public ResponseEntity<Void> deleteCustomElement(@PathVariable Integer customId) {
		customElementService.delete(customId);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
}
