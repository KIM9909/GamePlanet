package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomElementRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.domain.CustomElementUpdate;
import com.meeple.meeple_back.gameCustom.bluemarble.domain.CustomStatus;
import com.meeple.meeple_back.user.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tbl_game_custom_element")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomElementEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer customId;

	@Column(name = "custom_name", length = 20)
	private String customName;
	@Column(name = "created_at")
	private LocalDateTime createdAt;
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@Column(name = "image_url")
	private String fileUrl;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "custom_status")
	private CustomStatus customStatus;


	public CustomElementEntity(User user, String customName, String fileUrl) {
		this.customName = customName;
		this.setFileUrl(fileUrl);
		this.setUser(user);
		this.createdAt = LocalDateTime.now();
		this.customStatus = CustomStatus.BEFORE;
	}


	public static CustomElementEntity from(CustomElementRequest request, User user) {
		return CustomElementEntity.builder()
				.customName(request.getCustomName())
				.user(user)
				.createdAt(LocalDateTime.now())
				.updatedAt(LocalDateTime.now())
				.customStatus(CustomStatus.BEFORE)
				.build();
	}

	public static CustomElementResponse to(CustomElementEntity customElementEntity) {
		return CustomElementResponse.builder()
				.customId(customElementEntity.getCustomId())
				.customName(customElementEntity.getCustomName())
				.createdAt(customElementEntity.getCreatedAt())
				.updatedAt(customElementEntity.getUpdatedAt())
				.build();
	}

	public void update(CustomElementUpdate update) {
		this.customName = update.getCustomName();
		this.updatedAt = LocalDateTime.now();
	}
}
