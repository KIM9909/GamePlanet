package com.meeple.meeple_back.gameCustom.bluemarble.service;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomElementRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementJpaRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomElementService implements CrudService<CustomElementRequest, CustomElementResponse, Integer> {
	private final CustomElementJpaRepository customElementRepository;



	@Override
	public CustomElementResponse create(CustomElementRequest customElementRequest) {
		return CustomElementResponse.from(customElementRepository.save(CustomElementEntity.from(customElementRequest)));
	}

	@Override
	public CustomElementResponse findById(Integer integer) {
		return CustomElementResponse.from(customElementRepository.findById(integer).orElseThrow());
	}

	@Override
	public CustomElementResponse update(Integer integer,
			CustomElementRequest customElementRequest) {
		CustomElementEntity customElementEntity = customElementRepository.findById(integer).orElseThrow();
		customElementEntity.update(customElementRequest);
		return CustomElementResponse.from(customElementRepository.save(customElementEntity));
	}

	@Override
	public void delete(Integer integer) {
		customElementRepository.deleteById(integer);
	}

	@Override
	public List<CustomElementResponse> findAll() {
		return customElementRepository.findAll().stream().map(CustomElementEntity::to).toList();
	}
}
