package com.meeple.meeple_back.tournament.service;

import com.meeple.meeple_back.tournament.model.request.RequestCreateTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseCreateTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseTournamentList;

import java.util.List;

public interface TournamentService {
    ResponseCreateTournament createTournament(RequestCreateTournament request);

    List<ResponseTournamentList> getTournamentList();

    ResponseTournament getTournament(long tournamentId);
}
