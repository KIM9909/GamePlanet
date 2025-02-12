package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomElementJpaRepository extends JpaRepository<CustomElementEntity, Integer> {

}
