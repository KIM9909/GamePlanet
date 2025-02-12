package com.meeple.meeple_back.gameCustom.bluemarble.controller;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementEntity;
import java.util.List;
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
public class CustomElementController {



	// READ ALL
	@GetMapping
	public List<CustomElementResponse> getAllCustomElements() {
		return customElementRepository.findAll();
	}

	// READ ONE
	@GetMapping("/{customId}")
	public CustomElementResponse getCustomElementById(@PathVariable Integer customId) {
		return customElementRepository.findById(customId)
				.orElseThrow(() -> new RuntimeException("CustomElement not found: " + customId));
	}

	// UPDATE
	@PutMapping("/{customId}")
	public CustomElementResponse updateCustomElement(@PathVariable Integer customId,
			@RequestBody CustomElement updated) {
		CustomElement existing = customElementRepository.findById(customId)
				.orElseThrow(() -> new RuntimeException("CustomElement not found: " + customId));
		existing.setCustomName(updated.getCustomName());
		existing.setCreatedAt(updated.getCreatedAt());
		existing.setUpdatedAt(updated.getUpdatedAt());
		// 필요한 필드만 수정
		return customElementRepository.save(existing);
	}

	// DELETE
	@DeleteMapping("/{customId}")
	public void deleteCustomElement(@PathVariable Integer customId) {
		customElementRepository.deleteById(customId);
	}
}
