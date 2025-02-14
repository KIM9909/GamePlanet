package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileRequest;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tbl_custom_tile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomTileEntity {

	@EmbeddedId
	private CustomTileId id;

	@ManyToOne
	@MapsId("customId")
	@JoinColumn(name = "custom_id")
	private CustomElementEntity customElement;

	@ManyToOne
	@MapsId("tileId")
	@JoinColumn(name = "tile_id")
	private TileEntity tileEntity;

}