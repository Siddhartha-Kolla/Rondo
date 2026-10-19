/*
  HOW THE ROUND ASSIGNMENT WORKS

  Data: a round is a list of matches (one per table). A match is two teams of two
  player ids: [[a1, a2], [b1, b2]]. Each match has a winner: 0 (team A), 1 (team B)
  or null (not played yet). Players missing from a round are sitting out.

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
  Partners count 3x as much as opponents. Change PARTNER_WEIGHT to tune that.
*/

export type Team = [string, string];
export type Match = { teams: [Team, Team]; winner: 0 | 1 | null };
export type Round = Match[];

const PARTNER_WEIGHT = 3;
const TRIES = 500;

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const playersOf = (round: Round): string[] => round.flatMap((m) => m.teams.flat());

function timesSatOut(player: string, history: Round[]): number {
  return history.filter((round) => !playersOf(round).includes(player)).length;
}

// How often were a and b partners (asPartners = true) or opponents (false) so far?
function timesTogether(a: string, b: string, history: Round[], asPartners: boolean): number {
  let count = 0;
  for (const round of history) {
    for (const { teams: [teamA, teamB] } of round) {
      const partners = (teamA.includes(a) && teamA.includes(b)) || (teamB.includes(a) && teamB.includes(b));
      const opponents = (teamA.includes(a) && teamB.includes(b)) || (teamB.includes(a) && teamA.includes(b));
      if (asPartners ? partners : opponents) count++;
    }
  }
  return count;
}

function cost(round: Round, history: Round[]): number {
  let total = 0;
  for (const { teams: [teamA, teamB] } of round) {
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
    round.push({ teams: [[players[i], players[i + 1]], [players[i + 2], players[i + 3]]], winner: null });
  }
  return round;
}

export function nextRound(players: string[], history: Round[], tables: number): Round {
  const matchCount = Math.min(tables, Math.floor(players.length / 4));

  // 1. Those who sat out the least sit out now (ties are random)
  const bySitOuts = shuffle(players).sort((a, b) => timesSatOut(a, history) - timesSatOut(b, history));
  const sitting = bySitOuts.slice(0, players.length - matchCount * 4);
  const playing = players.filter((p) => !sitting.includes(p));

  // 2 + 3. Try random lineups, keep the cheapest
  let best = toRound(shuffle(playing));
  let bestCost = cost(best, history);
  for (let i = 0; i < TRIES; i++) {
    const candidate = toRound(shuffle(playing));
    const candidateCost = cost(candidate, history);
    if (candidateCost < bestCost) {
      best = candidate;
      bestCost = candidateCost;
    }
  }
  return best;
}

export type Standing = {
  id: string;
  stars: number; // one point (star) per won match
  games: number; // decided matches played
  streak: number; // wins in a row, counting only games the player played
};

// Everyone passed in gets a row, sorted by stars, then by win rate, then by fewer games.
export function standings(playerIds: string[], rounds: Round[]): Standing[] {
  const table = new Map<string, Standing>(playerIds.map((id) => [id, { id, stars: 0, games: 0, streak: 0 }]));
  for (const round of rounds) {
    for (const { teams, winner } of round) {
      if (winner === null) continue;
      teams.forEach((team, index) => {
        for (const id of team) {
          const row = table.get(id);
          if (!row) continue;
          row.games++;
          if (index === winner) {
            row.stars++;
            row.streak++;
          } else {
            row.streak = 0;
          }
        }
      });
    }
  }
  const rate = (s: Standing) => (s.games === 0 ? 0 : s.stars / s.games);
  return [...table.values()].sort((a, b) => b.stars - a.stars || rate(b) - rate(a) || a.games - b.games);
}

export type PairRecord = { id: string; games: number; wins: number };
export type LogEntry = { round: number; table: number; partner: string; opponents: Team; won: boolean | null };
export type FormCell = "win" | "loss" | "sat" | "pending";

export type History = {
  stars: number;
  games: number;
  sat: number; // rounds without a table
  bestStreak: number;
  streak: number;
  partners: PairRecord[]; // most games first
  opponents: PairRecord[];
  neverPartnered: string[]; // other players this one has not teamed up with yet
  neverFaced: string[];
  log: LogEntry[]; // newest first
  form: FormCell[]; // oldest first, last 10 rounds
};

// Everything one player did, read off the rounds. Only decided matches count as games.
export function playerHistory(playerId: string, others: string[], rounds: Round[]): History {
  const partners = new Map<string, PairRecord>();
  const opponents = new Map<string, PairRecord>();
  const log: LogEntry[] = [];
  const form: FormCell[] = [];
  let stars = 0, games = 0, sat = 0, streak = 0, bestStreak = 0;

  const bump = (map: Map<string, PairRecord>, id: string, won: boolean) => {
    const row = map.get(id) ?? { id, games: 0, wins: 0 };
    row.games++;
    if (won) row.wins++;
    map.set(id, row);
  };

  rounds.forEach((round, roundIndex) => {
    const tableIndex = round.findIndex((m) => m.teams.some((team) => team.includes(playerId)));
    if (tableIndex === -1) {
      sat++;
      form.push("sat");
      return;
    }
    const { teams, winner } = round[tableIndex];
    const side = teams[0].includes(playerId) ? 0 : 1;
    const partner = teams[side].find((id) => id !== playerId)!;
    const opposing = teams[1 - side];
    log.push({ round: roundIndex + 1, table: tableIndex + 1, partner, opponents: opposing, won: winner === null ? null : winner === side });
    if (winner === null) {
      form.push("pending");
      return;
    }
    const won = winner === side;
    games++;
    form.push(won ? "win" : "loss");
    bump(partners, partner, won);
    opposing.forEach((id) => bump(opponents, id, won));
    if (won) {
      stars++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  });

  const byGames = (a: PairRecord, b: PairRecord) => b.games - a.games || b.wins - a.wins;
  return {
    stars,
    games,
    sat,
    bestStreak,
    streak,
    partners: [...partners.values()].sort(byGames),
    opponents: [...opponents.values()].sort(byGames),
    neverPartnered: others.filter((id) => id !== playerId && !partners.has(id)),
    neverFaced: others.filter((id) => id !== playerId && !opponents.has(id)),
    log: log.reverse(),
    form: form.slice(-10),
  };
}
