package com.meeple.meeple_back.gameCustom.bluemarble.service;

import com.meeple.meeple_back.game.bluemarble.domain.CardType;
import com.meeple.meeple_back.game.bluemarble.domain.Tile;
import com.meeple.meeple_back.game.bluemarble.domain.TileType;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomElementRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTileCardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileImageResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CardEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CardJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomCardEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomCardId;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomCardJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomTileEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomTileId;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomTileJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.TileEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.TileJpaRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomElementService implements CrudService<CustomElementRequest, CustomElementResponse, Integer> {
	private final CustomElementJpaRepository customElementRepository;
	private final TileJpaRepository tileJpaRepository;
	private final CardJpaRepository cardJpaRepository;
	private final CustomTileJpaRepository customTileJpaRepository;
	private final CustomCardJpaRepository customCardJpaRepository;
	private final CustomElementJpaRepository customElementJpaRepository;


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

    public CustomTileCardResponse createTileAndCard(int customId, CustomTileCardRequest request) {
		// 타일 생성
		TileEntity tileEntity = new TileEntity(request.getName(), TileType.SEED_CERTIFICATE_CARD.name(), request.getImageUrl(), request.getSeedCount(),request.getNumber());
		// 카드 생성
		CardEntity cardEntity = new CardEntity(request.getNumber(), request.getName(), request.getDescription(),
			CardType.SEED_CERTIFICATE_CARD.name(), request.getCardColor(), request.getSeedCount(), request.getBaseConstructionCost(),request.getHeadquartersUsageFee(),request.getBaseUsageFee());

		tileJpaRepository.save(tileEntity);
		cardJpaRepository.save(cardEntity);

		CustomElementEntity customElementEntity = customElementRepository.findById(customId).orElseThrow();
		// 커스텀 타일 생성
		// 커스텀 카드 생성
		CustomTileId customTileId = new CustomTileId(customId, tileEntity.getTileId());
		CustomCardId customCardId = new CustomCardId(customId, cardEntity.getCardId());
		CustomTileEntity customTileEntity = new CustomTileEntity(customTileId, customElementEntity, tileEntity);
		CustomCardEntity customCardEntity = new CustomCardEntity(customCardId, customElementEntity, cardEntity);

		// 저장 후 tile, card 정보 담아서 return
		customTileJpaRepository.save(customTileEntity);
		customCardJpaRepository.save(customCardEntity);
		TileResponse tileResponse = TileResponse.from(tileEntity);
		CardResponse cardResponse = new CardResponse(cardEntity.getCardId(), cardEntity.getCardNumber(), cardEntity.getCardName(), cardEntity.getCardDescription(), cardEntity.getCardType(),cardEntity.getCardColor(), cardEntity.getCardSeedCount(),cardEntity.getCardBaseConstructionCost() , cardEntity.getCardHeadquartersUsageFee(),cardEntity.getCardBaseUsageFee());
		return new CustomTileCardResponse(tileResponse, cardResponse);
    }

	public List<TileImageResponse> findTileImageUrlByCustomId(Integer customId) {
		// customID에 해당하는 타일의 번호에 해당하는 이미지 목록을 반환한다.
		List<TileEntity> tileEntities = customTileJpaRepository.findTileEntitiesByCustomId(customId);
		List<TileImageResponse> result = new ArrayList<>();
		for(int i=0; i<tileEntities.size(); i++){
			TileEntity tileEntity = tileEntities.get(i);
			result.add(new TileImageResponse(tileEntity.getTileNumber(), tileEntity.getTileImageUrl()));
		}
		return result;
	}

	public String getExistingImageUrl(int customId, int number) {
		return customElementJpaRepository.findImageUrlByCustomIdAndNumber(customId, number);
	}

	public CustomTileCardResponse updateTileAndCard(int customId, CustomTileCardRequest request) {
		TileEntity tileEntity = tileJpaRepository.findByTileNumberAndCustomId(customId, request.getNumber());
		// 카드 생성
		CardEntity cardEntity = cardJpaRepository.findByCardNumberAndCustomId(customId, request.getNumber());

		;
		tileEntity = tileJpaRepository.save(tileEntity.update(request));
		cardEntity = cardJpaRepository.save(cardEntity.update(request));

		// 커스텀 타일 생성
		// 커스텀 카드 생성

		// 저장 후 tile, card 정보 담아서 return
		TileResponse tileResponse = TileResponse.from(tileEntity);
		CardResponse cardResponse = new CardResponse(cardEntity.getCardId(), cardEntity.getCardNumber(), cardEntity.getCardName(), cardEntity.getCardDescription(), cardEntity.getCardType(),cardEntity.getCardColor(), cardEntity.getCardSeedCount(),cardEntity.getCardBaseConstructionCost() , cardEntity.getCardHeadquartersUsageFee(),cardEntity.getCardBaseUsageFee());
		return new CustomTileCardResponse(tileResponse, cardResponse);
	}
}
