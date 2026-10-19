"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {useState} from "react";

// A round is a list of matches, a match is [[a1, a2], [b1, b2]].
// Sit-outs are the players missing from a round.
const key = (x: string, y: string) => (x < y ? `${x}|${y}` : `${y}|${x}`);
const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

function nextRound(players: string[], rounds: string[][][][]): string[][][] {
  const partnered = new Map<string, number>();
  const opposed = new Map<string, number>();
  const sitouts = new Map(players.map((p) => [p, 0]));
  const lastPlayed = new Map(players.map((p) => [p, -1]));
  const inc = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);

  rounds.forEach((round, i) => {
    const playing = round.flat(2);
    players.filter((p) => !playing.includes(p)).forEach((p) => inc(sitouts, p));
    round.forEach(([a, b]) => {
      inc(partnered, key(a[0], a[1]));
      inc(partnered, key(b[0], b[1]));
      for (const x of a) for (const y of b) inc(opposed, key(x, y));
      [...a, ...b].forEach((p) => lastPlayed.set(p, i));
    });
  });

  // Fewest sit-outs so far sits first; ties: most recently played sits first
  const sitting = shuffle(players)
    .sort((x, y) => sitouts.get(x)! - sitouts.get(y)! || lastPlayed.get(y)! - lastPlayed.get(x)!)
    .slice(0, players.length % 4);
  const active = players.filter((p) => !sitting.includes(p));

  // lineup: [0..3] = match 1 (0,1 vs 2,3), [4..7] = match 2, ...
  const cost = (l: string[]) => {
    let c = 0;
    for (let i = 0; i < l.length; i += 4) {
      const [p1, p2, p3, p4] = l.slice(i, i + 4);
      c += 3 * ((partnered.get(key(p1, p2)) ?? 0) ** 2 + (partnered.get(key(p3, p4)) ?? 0) ** 2);
      for (const x of [p1, p2]) for (const y of [p3, p4]) c += (opposed.get(key(x, y)) ?? 0) ** 2;
    }
    return c;
  };

  let best = shuffle(active);
  let bestCost = cost(best);
  for (let r = 0; r < 30; r++) {
    const cur = shuffle(active);
    let curCost = cost(cur);
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < cur.length; i++)
        for (let j = i + 1; j < cur.length; j++) {
          [cur[i], cur[j]] = [cur[j], cur[i]];
          const c = cost(cur);
          if (c < curCost) { curCost = c; improved = true; }
          else [cur[i], cur[j]] = [cur[j], cur[i]];
        }
    }
    if (curCost < bestCost) { best = cur; bestCost = curCost; }
  }

  const round: string[][][] = [];
  for (let i = 0; i < best.length; i += 4)
    round.push([[best[i], best[i + 1]], [best[i + 2], best[i + 3]]]);
  return round;
}


export default function Home() {
  const [players, setPlayers] = useState<string[]>(["1", "2", "3", "4", "5", "6", "7"]);
  const [combinations, setCombinations] = useState<string[][][][]>([]);
// PLayer matrix = {name: string, plays: [{opponent: string, count: number, result: [string]}]}
  const [playerMatrix, setPlayerMatrix] = useState<{name: string, plays: {opponent: string, count: number, result: string[]}[]}[]>([]);
  
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Button className="mb-4" onClick={() => setCombinations([...combinations, nextRound(players, combinations)])}>Next round</Button>
      <div className="flex flex-col gap-2">
        {combinations.map((combination, index) => (
          <div key={index} className="flex gap-2">
            {combination.map((player, index) => (
              <div key={index} className="flex items-center justify-center px-4 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                {player[0].join(" & ")} vs {player[1].join(" & ")}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Neat graphical representation of a table tennis table */}
      {/* Blue, vertical and modern professional look like shadcn ui, (should also act like buttons) */}
      {/* Display things like player names by clicking on the corresponding table quarter */}
    </div>
  );
}