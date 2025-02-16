package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import io.lettuce.core.dynamic.annotation.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CustomCardJpaRepository extends JpaRepository<CustomCardEntity, CustomCardId> {

	@Query("SELECT c FROM CustomCardEntity c WHERE c.customElement.customId = :customId")
	List<CustomCardEntity> findCustomCardEntitiesByCustomId(@Param("customId") int customId);

	@Query("SELECT c FROM CardEntity c WHERE c.cardId IN (" +
			"SELECT cc.card.cardId FROM CustomCardEntity cc WHERE cc.customElement.customId = :customId"
			+
			") AND c.cardType = :cardType")
	List<CardEntity> findAllSeedCard(@Param("customId") Integer customId,
			@Param("cardType") String cardType);

	@Query("SELECT c.card FROM CustomCardEntity c WHERE c.customElement.customId = :customId AND c.card.cardId = :cardId")
	Optional<CardEntity> findByCardIdAndCustomElement_CustomId(Integer cardId, Integer customId);

	@Modifying
	@Query("DELETE FROM CardEntity c WHERE c.cardId IN(SELECT ct.card.cardId FROM CustomCardEntity ct WHERE ct.customElement = :customId)")
	void deleteCardByCustomId(@Param("customId") Integer customId);

	@Modifying
	@Query("DELETE FROM CustomCardEntity ce WHERE ce.customElement.customId = :customId")
	void deleteByCustomId(@Param("customId") Integer customId);

	@Query("SELECT c.card.cardId FROM CustomCardEntity c WHERE c.customElement.customId = :customId AND c.card.cardNumber = :tileNumber")
	int findIdByCustomIdAndTileNumber(@Param("customId") Integer customId,
			@Param("tileNumber") Integer tileNumber);

	@Modifying
	@Query("DELETE FROM CustomCardEntity c WHERE c.customElement.customId = :customId AND c.card.cardNumber = :tileNumber")
	void deleteByCustomIdAndTileNumber(@Param("customId") Integer customId,
			@Param("tileNumber") Integer tileNumber);

	@Query("SELECT c.card.cardId FROM CustomCardEntity c WHERE c.customElement.customId = :customId")
	List<Integer> findIdsByCustomIdAndTileNumber(@Param("customId") Integer customId);
}
