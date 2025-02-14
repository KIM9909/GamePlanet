package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomElementJpaRepository extends JpaRepository<CustomElementEntity, Integer> {

	@Query("SELECT t.tileImageUrl FROM TileEntity t WHERE t.tileNumber=:number AND t.tileId IN (" +
			"SELECT ct.tileEntity.tileId FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId" +
			")")
	String findImageUrlByCustomIdAndNumber(@Param("customId") Integer customId,@Param("number") Integer number);
}
