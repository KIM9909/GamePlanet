package com.meeple.meeple_back.tournament.controller;

import com.meeple.meeple_back.tournament.model.request.RequestCreateTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseCreateTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseTournament;
import com.meeple.meeple_back.tournament.model.response.ResponseTournamentList;
import com.meeple.meeple_back.tournament.service.TournamentService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(name = "/api/tournament")
@AllArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @PostMapping
    public ResponseEntity<ResponseCreateTournament> createTournament(
            @RequestBody RequestCreateTournament request
            ) {
        ResponseCreateTournament response = tournamentService.createTournament(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ResponseTournamentList>> getTournamentList() {
        List<ResponseTournamentList> response = tournamentService.getTournamentList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{tournamentId}")
    public ResponseEntity<ResponseTournament> getTournament(
            @PathVariable long tournamentId
    ) {
        ResponseTournament response = tournamentService.getTournament(tournamentId);

        return ResponseEntity.ok(response);
    }
}
