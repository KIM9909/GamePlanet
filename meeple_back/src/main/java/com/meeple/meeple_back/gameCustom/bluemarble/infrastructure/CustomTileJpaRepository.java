package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import io.lettuce.core.dynamic.annotation.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomTileJpaRepository extends JpaRepository<CustomTileEntity, CustomTileId> {

	@Query("SELECT t FROM TileEntity t WHERE t.tileId IN (" +
			"SELECT ct.tileEntity.tileId FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId"
			+
			")")
	List<TileEntity> findTileEntitiesByCustomId(@Param("customId") int customId);

	@Modifying
	@Query("DELETE FROM TileEntity t WHERE t.tileId IN (SELECT ct.tileEntity.tileId FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId)")
	void deleteTileByCustomId(@Param("customId") Integer customId);

	@Modifying
	@Query("DELETE FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId")
	void deleteByCustomId(@Param("customId") Integer customId);


	@Query("SELECT ct.tileEntity.tileId FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId AND ct.tileEntity.tileNumber = :tileNumber")
	int findByIdByCustomIdAndTileNumber(@Param("customId") Integer customId,
			@Param("tileNumber") Integer tileNumber);


	@Modifying
	@Query("DELETE FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId AND ct.tileEntity.tileNumber = :tileNumber")
	void deleteByCustomIdAndTileNumber(@Param("customId") Integer customId,
			@Param("tileNumber") Integer tileNumber);

	@Query("SELECT ct.tileEntity.tileId FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId")
	List<Integer> findByIdsByCustomIdAndTileNumber(@Param("customId") Integer customId);

	@Query("SELECT ct.tileEntity FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId")
	List<TileEntity> findByCustomId(Integer customId);
}
