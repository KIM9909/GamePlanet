package com.meeple.meeple_back.gameCustom.bluemarble.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomElementUpdate {
    private int customId;
    private String customName;
}
