package com.meeple.meeple_back.gameCustom.bluemarble.service;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.domain.CustomElementCreate;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomElementService {
	private final CustomElementJpaRepository customElementRepository;


	public CustomElementResponse create(CustomElementCreate create) {
		CustomElementEntity entity = CustomElementEntity.from(create);
		return CustomElementResponse.from(customElementRepository.save(entity));
	}
}
