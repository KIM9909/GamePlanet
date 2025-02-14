package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardJpaRepository extends JpaRepository<CardEntity, Integer> {
	@Query("select c from CardEntity c where c.cardId IN (select t.id.cardId from CustomCardEntity t where t.customElement.customId = :customId) AND c.cardNumber = :tileNumber")
	Optional<CardEntity> findByCustomIdAndCardNumber(int customId, Integer tileNumber);

	@Query("select c from CardEntity c where c.cardNumber= :number AND c.cardId IN (select cc.card.cardId from CustomCardEntity cc where cc.customElement.customId = :customId)")
	CardEntity findByCardNumberAndCustomId(int customId, int number);
}
