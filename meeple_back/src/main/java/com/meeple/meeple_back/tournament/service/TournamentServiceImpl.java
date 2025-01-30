package com.meeple.meeple_back.tournament.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.repo.GameRepository;
import com.meeple.meeple_back.tournament.model.entity.ParticipantStatus;
import com.meeple.meeple_back.tournament.model.entity.Tournament;
import com.meeple.meeple_back.tournament.model.entity.TournamentParticipant;
import com.meeple.meeple_back.tournament.model.request.RequestCreateTournament;
import com.meeple.meeple_back.tournament.model.request.RequestJoinTournament;
import com.meeple.meeple_back.tournament.model.request.RequestUpdateTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseCreateTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseTournamentList;
import com.meeple.meeple_back.tournament.model.response.ResponseUpdateTournament;
import com.meeple.meeple_back.tournament.repository.TournamentParticipantRepository;
import com.meeple.meeple_back.tournament.repository.TournamentRepository;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
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
    private final TournamentParticipantRepository tournamentParticipantRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
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

    @Override
    public ResponseUpdateTournament updateTournament(long tournamentId, RequestUpdateTournament request) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 토너먼트 입니다."));

        if (!request.getTournamentTitle().equals(tournament.getTournamentTitle())) {
            tournament.setTournamentTitle(request.getTournamentTitle());
        }

        if (request.getTournamentTotalRound() != tournament.getTournamentTotalRound()) {
            tournament.setTournamentTotalRound(request.getTournamentTotalRound());
        }

        if (!request.getTournamentInfo().equals(tournament.getTournamentInfo())) {
            tournament.setTournamentInfo(request.getTournamentInfo());
        }

        if (request.getTournamentRequireRank() != tournament.getTournamentRequireRank()) {
            tournament.setTournamentRequireRank(request.getTournamentRequireRank());
        }

        if (request.getTournamentPublicState() != tournament.getTournamentPublicState()) {
            tournament.setTournamentPublicState(request.getTournamentPublicState());
        }

        if (!request.getTournamentEndDate().isEqual(tournament.getTournamentEndDate())) {
            tournament.setTournamentStartTime(request.getTournamentStartTime());
        }

        if (!request.getTournamentStartTime().isEqual(tournament.getTournamentStartTime())) {
            tournament.setTournamentStartTime(request.getTournamentStartTime());
        }

        if (!request.getTournamentEndTime().isEqual(tournament.getTournamentEndTime())) {
            tournament.setTournamentEndTime(request.getTournamentEndTime());
        }

        if (request.getGameId() != tournament.getGame().getGameId()) {
            Game game = gameRepository.findById(request.getGameId())
                    .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 게임입니다."));

            tournament.setGame(game);
        }

        Tournament updatedTournament = tournamentRepository.save(tournament);

        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        return mapper.map(updatedTournament, ResponseUpdateTournament.class);
    }

    @Override
    public String joinTournament(RequestJoinTournament request) {
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 토너먼트"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 회원"));

        List<TournamentParticipant> participantList = tournamentParticipantRepository
                .findByTournament_TounamentId(request.getTournamentId());

        if (participantList.size() >= tournament.getTournamentTotalRound() ) {
            return "토너먼트 참가 인원이 가득찼습니다";
        }

        TournamentParticipant tournamentParticipant = TournamentParticipant.builder()
                .participantStatus(ParticipantStatus.WAIT)
                .tournament(tournament)
                .user(user)
                .build();

        tournamentParticipantRepository.save(tournamentParticipant);

        return user.getUserNickname() + " 토너먼트 참여 성공";
    }
}
