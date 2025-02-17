package com.meeple.meeple_back.gameCustom.bluemarble.service;

import com.meeple.meeple_back.game.bluemarble.domain.SeedCertificateCard;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomNeuronValleyCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomSeedcardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTelepathyCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomCardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomNeuronValleyCardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomSeedcardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomTelepathyCardResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CardEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CardJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomCardEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomCardId;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomCardJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementJpaRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomCardService {

	private final CustomCardJpaRepository customCardJpaRepository;
	private final CustomElementJpaRepository customElementJpaRepository;
	private final CardJpaRepository cardJpaRepository;


	@Transactional
	public CustomSeedcardResponse createSeedCard(Integer customId, CustomSeedcardRequest request) {
		CardEntity cardEntity = cardJpaRepository.save(CardEntity.from(request));
		CustomCardId customCardId = CustomCardId.builder()
				.customId(customId)
				.cardId(cardEntity.getCardId())
				.build();
		CustomElementEntity customElementEntity = customElementJpaRepository.findById(customId)
				.orElseThrow();
		CustomCardEntity customCard = new CustomCardEntity(customCardId, customElementEntity,
				cardEntity);
		return CustomSeedcardResponse.from(customCard);
	}

	@Transactional
	public CustomTelepathyCardResponse createTelepathyCard(Integer customId,
			CustomTelepathyCardRequest request) {
		CardEntity cardEntity = cardJpaRepository.save(CardEntity.fromTelepathyCard(request));
		CustomCardId customCardId = CustomCardId.builder()
				.customId(customId)
				.cardId(cardEntity.getCardId())
				.build();
		CustomElementEntity customElementEntity = customElementJpaRepository.findById(customId)
				.orElseThrow();
		CustomCardEntity customCard = new CustomCardEntity(customCardId, customElementEntity,
				cardEntity);
		return CustomTelepathyCardResponse.from(customCard);
	}

	public CustomNeuronValleyCardResponse createNeuronValleyCard(Integer customId,
			CustomNeuronValleyCardRequest request) {
		CardEntity cardEntity = cardJpaRepository.save(CardEntity.fromNeuronValleyCard(request));
		CustomCardId customCardId = CustomCardId.builder()
				.customId(customId)
				.cardId(cardEntity.getCardId())
				.build();
		CustomElementEntity customElementEntity = customElementJpaRepository.findById(customId)
				.orElseThrow();
		CustomCardEntity customCard = new CustomCardEntity(customCardId, customElementEntity,
				cardEntity);
		return CustomNeuronValleyCardResponse.from(customCard);
	}

	public List<CustomSeedcardResponse> findAllSeedCard(Integer customId) {
		List<CardEntity> customCardEntity = customCardJpaRepository.findAllSeedCard(customId,
				"SEED_CERTIFICATE_CARD");
		return customCardEntity.stream()
				.map(CustomSeedcardResponse::fromCardEntity)
				.collect(Collectors.toList());
	}

	public List<CustomTelepathyCardResponse> findAllTelepathyCards(Integer customId) {
		List<CardEntity> customCardEntity = customCardJpaRepository.findAllSeedCard(customId,
				"TELEPATHY_CARD");
		return customCardEntity.stream()
				.map(CustomTelepathyCardResponse::fromCardEntity)
				.collect(Collectors.toList());
	}

	public List<CustomNeuronValleyCardResponse> findAllNeuronValleyCards(Integer customId) {
		List<CardEntity> customCardEntity = customCardJpaRepository.findAllSeedCard(customId,
				"NEURONS_VALLEY_CARD");
		return customCardEntity.stream()
				.map(CustomNeuronValleyCardResponse::fromCardEntity)
				.collect(Collectors.toList());
	}

	public CustomCardResponse findById(CustomCardId id) {
		CustomCardEntity customCardEntity = customCardJpaRepository.findById(id).orElseThrow();
		return CustomCardResponse.from(customCardEntity);
	}


	public void delete(CustomCardId id) {
		cardJpaRepository.deleteById(id.getCardId());
		customCardJpaRepository.deleteById(id);
	}

	public CustomCardResponse update(CustomCardId id, CustomCardRequest request) {
		CardEntity cardEntity = customCardJpaRepository.findByCardIdAndCustomElement_CustomId(
				id.getCardId(), id.getCustomId()).orElseThrow();
		cardEntity.update(request);
		cardEntity = cardJpaRepository.save(cardEntity);
		return CustomCardResponse.fromCardEntity(cardEntity);
	}

	public List<SeedCertificateCard> findSeedCertificateCardByCustomId(Integer customId) {
		return customCardJpaRepository.findSeedCertificateCardByCustomId(customId);
	}
}
