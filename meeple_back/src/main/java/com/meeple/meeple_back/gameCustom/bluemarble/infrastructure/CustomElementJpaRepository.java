package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import io.lettuce.core.dynamic.annotation.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomElementJpaRepository extends JpaRepository<CustomElementEntity, Integer> {

	@Query("SELECT t.tileImageUrl FROM TileEntity t WHERE t.tileNumber=:number AND t.tileId IN (" +
			"SELECT ct.tileEntity.tileId FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId"
			+
			")")
	String findImageUrlByCustomIdAndNumber(@Param("customId") Integer customId,
			@Param("number") Integer number);

	// 현재 customTile or customCard에서 customId를 가진 요소중 tile아이디들과 같은 number 반환하기.

	@Query("SELECT t.tileNumber FROM TileEntity t WHERE t.tileId IN ( SELECT ct.tileEntity.tileId FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId)")
	List<Integer> findCompleteElementListByCustomId(Integer customId);

	@Query("select ce from CustomElementEntity ce where ce.user.userId = :userId")
	List<CustomElementEntity> findByUserId(Long userId);

}
