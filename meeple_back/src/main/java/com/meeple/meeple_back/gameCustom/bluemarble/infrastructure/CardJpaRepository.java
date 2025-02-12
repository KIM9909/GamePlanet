package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardJpaRepository extends JpaRepository<CardEntity, Integer> {
	@Query("select c from CardEntity c where c.cardNumber = :tileNumber and c.cardNumber IN (select t.tileEntity.tileNumber from CustomTileEntity t where t.customElement.customId = :customId)")
	Optional<CardEntity> findByCustomIdAndCardNumber(int customId, Integer tileNumber);

}
