package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileCardRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TileJpaRepository extends JpaRepository<TileEntity, Integer> {


	//customId와 tineNumber로 tile엔터티 가져오기
	@Query("select t from TileEntity t where t.tileNumber= :number AND t.tileId IN (select ct.tileEntity.tileId from CustomTileEntity ct where ct.customElement.customId = :customId)")
	TileEntity findByTileNumberAndCustomId(int customId,int number);


}
