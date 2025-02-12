package com.meeple.meeple_back.gameCustom.bluemarble.service;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomTileService {
	private final CustomElementJpaRepository customElementRepository;
	private final CustomTileJpaRepository customTileRepository;
	private final TileJpaRepository tileJpaRepository;
	private final CardJpaRepository cardJpaRepository;

	@Transactional
	public CustomTileResponse create(CustomTileRequest request, String tileColor) {
		TileEntity tile = tileJpaRepository.save(TileEntity.builder().tileName(request.getTileName()).tileNumber(request.getTileNumber()).tileType(request.getTileType()).tileImageUrl(request.getTileImageUrl()).tilePrice(request.getTilePrice()).build());
		CustomElementEntity customElementEntity = customElementRepository.findById(request.getCustomId()).orElseThrow();
		CustomTileEntity customTileEntity = customTileRepository.save(CustomTileEntity.builder().customElement(customElementEntity).tileEntity(tile).build());
		CardEntity cardEntity = cardJpaRepository.findByCustomIdAndCardNumber(request.getCustomId(), request.getTileNumber()).orElseThrow();
		cardEntity.setCardColor(tileColor);
		cardJpaRepository.save(cardEntity);
		return CustomTileResponse.from(customTileEntity);
	}

	@Transactional(readOnly = true)
	public CustomTileResponse findById(CustomTileId id) {
		CustomTileEntity customTileEntity = customTileRepository.findById(id).orElseThrow();
		return CustomTileResponse.from(customTileEntity);

	}

	@Transactional
	public CustomTileResponse update(CustomTileId id, CustomTileRequest customTileRequest) {
		TileEntity tile = customTileRepository.findById(id).orElseThrow().getTileEntity();
		tile.update(customTileRequest);
		tileJpaRepository.save(tile);
		CustomTileEntity customTileEntity = customTileRepository.findById(id).orElseThrow();
		return CustomTileResponse.from(customTileEntity);
	}

	@Transactional
	public void delete(CustomTileId id) {
		tileJpaRepository.deleteById(id.getTileId());
		customTileRepository.deleteById(id);
	}

	@Transactional(readOnly = true)
	public List<TileResponse> findAll(int customId) {
		return customTileRepository.findTileEntitiesByCustomId(customId).stream().map(TileEntity::toResponse).toList();
	}
}
