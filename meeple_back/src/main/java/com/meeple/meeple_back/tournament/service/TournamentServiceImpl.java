package com.meeple.meeple_back.tournament.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.repo.GameRepository;
import com.meeple.meeple_back.tournament.model.entity.Tournament;
import com.meeple.meeple_back.tournament.model.request.RequestCreateTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseCreateTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseTournamentList;
import com.meeple.meeple_back.tournament.repository.TournamentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TournamentServiceImpl implements TournamentService {
    private final TournamentRepository tournamentRepository;
    private final GameRepository gameRepository;
    private final ModelMapper mapper;

    @Override
    public ResponseCreateTournament createTournament(RequestCreateTournament request) {

        Game game = gameRepository.findById(request.getGameId())
                        .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 게임"));

        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        Tournament tournament = mapper.map(request, Tournament.class);

        tournament.setGame(game);

        Tournament savedTournament = tournamentRepository.save(tournament);

        return mapper.map(savedTournament, ResponseCreateTournament.class);
    }

    @Override
    public List<ResponseTournamentList> getTournamentList() {
        List<Tournament> tournamentList = tournamentRepository.findAll();

        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        return tournamentList.stream().map(tournament -> mapper
                .map(tournament, ResponseTournamentList.class))
                .collect(Collectors.toList());
    }

    @Override
    public ResponseTournament getTournament(long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 토너먼트 입니다."));

        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        return mapper.map(tournament, ResponseTournament.class);
    }
}
