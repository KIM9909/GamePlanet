package com.meeple.meeple_back.gameCustom.bluemarble.controller;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.domain.CustomElementCreate;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomElementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/custom-element")
@RequiredArgsConstructor
public class CustomElementCreateController {

	private final CustomElementService customElementService;
	// CREATE
	@PostMapping
	public CustomElementResponse create(@RequestBody CustomElementCreate create) {
		return customElementService.create(create);
	}
}
