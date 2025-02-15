package com.meeple.meeple_back.gameCustom.bluemarble.domain;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomElementUpdate {
    private int customId;
    private String customName;
}
