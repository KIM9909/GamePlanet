package com.meeple.meeple_back.gameCustom.bluemarble.service;

import com.meeple.meeple_back.game.bluemarble.domain.Tile;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CardEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CardJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomTileEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomTileId;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomTileJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.TileEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.TileJpaRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomTileService {

	private final CustomElementJpaRepository customElementRepository;
	private final CustomTileJpaRepository customTileRepository;
	private final TileJpaRepository tileJpaRepository;
	private final CardJpaRepository cardJpaRepository;
	private final CustomTileJpaRepository customTileJpaRepository;

	@Transactional
	public CustomTileResponse create(CustomTileRequest request, String tileColor) {
		// 타일 정보 생성
		TileEntity tile = tileJpaRepository.save(
				TileEntity.builder().tileName(request.getTileName())
						.tileNumber(request.getTileNumber()).tileType(request.getTileType())
						.tileImageUrl(request.getTileImageUrl()).tilePrice(request.getTilePrice())
						.build());
		// 커스텀 정보 가져오기
		CustomElementEntity customElementEntity = customElementRepository.findById(
				request.getCustomId()).orElseThrow();
		// 커스텀 타일 정보 저장
		CustomTileId customTileId = new CustomTileId(customElementEntity.getCustomId(),
				tile.getTileId());
		CustomTileEntity customTileEntity = new CustomTileEntity(customTileId, customElementEntity,
				tile);
		customTileRepository.save(customTileEntity);
		// 카드 정보 가져오기
		CardEntity cardEntity = cardJpaRepository.findByCustomIdAndCardNumber(request.getCustomId(),
				request.getTileNumber()).orElseThrow();
		// 색깔 변경
		cardEntity.setCardColor(tileColor);
		// 저장
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
//		tile.update(customTileRequest);
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
		return customTileRepository.findTileEntitiesByCustomId(customId).stream()
				.map(TileEntity::toResponse).toList();
	}

	public List<Tile> findTilesByCustomId(Integer customId) {
		List<TileEntity> tileEntities = customTileJpaRepository.findByCustomId(
				customId);
		return tileEntities.stream().map(TileEntity::toTile).toList();
	}
}
