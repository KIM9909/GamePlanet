package com.meeple.meeple_back.gameCustom.bluemarble.service;

import java.util.List;

public interface CrudService <Req,Res,ID> {
	Res create(Req req);
	Res findById(ID id);
	Res update(ID id, Req req);
	void delete(ID id);
	List<Res> findAll();
}
