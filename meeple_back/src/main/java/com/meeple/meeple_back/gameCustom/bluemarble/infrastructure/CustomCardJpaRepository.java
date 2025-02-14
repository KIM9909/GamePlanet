package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import io.lettuce.core.dynamic.annotation.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CustomCardJpaRepository extends JpaRepository<CustomCardEntity, CustomCardId> {

	@Query("SELECT c FROM CustomCardEntity c WHERE c.customElement.customId = :customId")
	List<CustomCardEntity> findCustomCardEntitiesByCustomId(@Param("customId") int customId);

	@Query("SELECT c FROM CardEntity c WHERE c.cardId IN (" +
			"SELECT cc.card.cardId FROM CustomCardEntity cc WHERE cc.customElement.customId = :customId" +
			") AND c.cardType = :cardType")
	List<CardEntity> findAllSeedCard(@Param("customId") Integer customId, @Param("cardType") String cardType);

	@Query("SELECT c.card FROM CustomCardEntity c WHERE c.customElement.customId = :customId AND c.card.cardId = :cardId")
	Optional<CardEntity> findByCardIdAndCustomElement_CustomId(Integer cardId, Integer customId);
}
