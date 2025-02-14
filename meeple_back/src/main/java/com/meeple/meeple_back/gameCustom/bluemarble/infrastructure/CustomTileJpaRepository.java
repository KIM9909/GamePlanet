package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileImageResponse;
import io.lettuce.core.dynamic.annotation.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomTileJpaRepository extends JpaRepository<CustomTileEntity, CustomTileId> {

	@Query("SELECT t FROM TileEntity t WHERE t.tileId IN (" +
			"SELECT ct.tileEntity.tileId FROM CustomTileEntity ct WHERE ct.customElement.customId = :customId" +
			")")
	List<TileEntity> findTileEntitiesByCustomId(@Param("customId") int customId);

}
