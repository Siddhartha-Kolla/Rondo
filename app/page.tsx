"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {useState} from "react";

/*
  HOW THE ROUND ASSIGNMENT WORKS

  Data: a round is a list of matches (one per table), a match is [[a1, a2], [b1, b2]]
  (team A vs team B). Players missing from a round are sitting out.

  Idea: for every new round we look at the history (all earlier rounds) and pick the
  lineup that repeats as few earlier pairings as possible.
    1. Decide who sits out: the players who sat out the fewest times so far.
    2. Try many random lineups for the remaining players.
    3. Give each lineup a COST and keep the cheapest one.

  COST of a lineup (lower = better), summed over all its matches:
    - for each team:  3 * (times these two were already partners)^2
    - for each pair of opponents:  (times these two already played against each other)^2
  Squaring makes repeats get expensive quickly: playing with someone for the 2nd time
  costs 3*1 = 3, the 3rd time 3*4 = 12. Meeting someone for the first time costs 0.
  Partners count 3x as much as opponents. Change the 3 (PARTNER_WEIGHT) to tune that.
*/
type Match = string[][];
type Round = Match[];

const PARTNER_WEIGHT = 3;
const TRIES = 500;

function shuffle(list: string[]): string[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function timesSatOut(player: string, history: Round[]): number {
  return history.filter((round) => !round.flat(2).includes(player)).length;
}

// How often were a and b partners (asPartners = true) or opponents (false) so far?
function timesTogether(a: string, b: string, history: Round[], asPartners: boolean): number {
  let count = 0;
  for (const round of history) {
    for (const [teamA, teamB] of round) {
      const partners = (teamA.includes(a) && teamA.includes(b)) || (teamB.includes(a) && teamB.includes(b));
      const opponents = (teamA.includes(a) && teamB.includes(b)) || (teamB.includes(a) && teamA.includes(b));
      if (asPartners ? partners : opponents) count++;
    }
  }
  return count;
}

function cost(round: Round, history: Round[]): number {
  let total = 0;
  for (const [teamA, teamB] of round) {
    for (const team of [teamA, teamB]) {
      total += PARTNER_WEIGHT * timesTogether(team[0], team[1], history, true) ** 2;
    }
    for (const a of teamA) {
      for (const b of teamB) {
        total += timesTogether(a, b, history, false) ** 2;
      }
    }
  }
  return total;
}

// Cut a list of players into matches: 4 players = [[p0, p1], [p2, p3]]
function toRound(players: string[]): Round {
  const round: Round = [];
  for (let i = 0; i < players.length; i += 4) {
    round.push([[players[i], players[i + 1]], [players[i + 2], players[i + 3]]]);
  }
  return round;
}

function nextRound(players: string[], history: Round[], tables: number): Round {
  const matchCount = Math.min(tables, Math.floor(players.length / 4));

  // 1. Those who sat out the least sit out now (ties are random)
  const bySitOuts = shuffle(players).sort((a, b) => timesSatOut(a, history) - timesSatOut(b, history));
  const sitting = bySitOuts.slice(0, players.length - matchCount * 4);
  const playing = players.filter((p) => !sitting.includes(p));

  // 2 + 3. Try random lineups, keep the cheapest
  let best = toRound(shuffle(playing));
  for (let i = 0; i < TRIES; i++) {
    const candidate = toRound(shuffle(playing));
    if (cost(candidate, history) < cost(best, history)) best = candidate;
  }
  return best;
}


export default function Home() {
  const [players, setPlayers] = useState<string[]>(["1", "2", "3", "4", "5", "6", "7","8","9", "10", "11", "12", "13", "14", "15", "16"]);
  const [tables, setTables] = useState(2);
  const [combinations, setCombinations] = useState<string[][][][]>([]);
// PLayer matrix = {name: string, plays: [{opponent: string, count: number, result: [string]}]}
  const [playerMatrix, setPlayerMatrix] = useState<{name: string, plays: {opponent: string, count: number, result: string[]}[]}[]>([]);
  
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <label className="mb-2 flex items-center gap-2">
        Tables
        <input type="number" min={1} value={tables} onChange={(e) => setTables(Math.max(1, Number(e.target.value)))} className="w-16 rounded border px-2 py-1" />
      </label>
      <Button className="mb-4" onClick={() => setCombinations([...combinations, nextRound(players, combinations, tables)])}>Next round</Button>
      <div className="flex flex-col gap-2">
        {combinations.map((combination, index) => (
          <div key={index} className="flex flex-col gap-1">
            <div className="flex gap-2">
              {combination.map((player, index) => (
                <div key={index} className="flex items-center justify-center px-4 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                  Table {index + 1}: {player[0].join(" & ")} vs {player[1].join(" & ")}
                </div>
              ))}
            </div>
            <div className="text-sm text-zinc-500">
              Sitting out: {players.filter((p) => !combination.flat(2).includes(p)).join(", ") || "-"}
            </div>
          </div>
        ))}
      </div>

      {/* Neat graphical representation of a table tennis table */}
      {/* Blue, vertical and modern professional look like shadcn ui, (should also act like buttons) */}
      {/* Display things like player names by clicking on the corresponding table quarter */}
    </div>
  );
}