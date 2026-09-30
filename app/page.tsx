"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {useEffect, useState} from "react";

function calculate(players: string[]): string[][][] {
  let combinations: string[][][] = [];
  for (let i = 1; i < players.length; i++) {
    let round = [...players];
    let combination: string[][] = [];
    while (round.length >= 1) {
      if (round.length == 1) {
        combination.push([round[0], ""]);
        break;
      }
      else {
        // combination.push(round[0]);
        // combination.push(round[round.length - 1]);
        combination.push([round[0], round[round.length - 1]]);
        round = round.slice(1,-1);

      }
    }
    players = [players[0], players[players.length - 1], ...players.slice(1, players.length - 1)];
    combinations.push(combination);
  }
  return combinations;
}


export default function Home() {
  const [players, setPlayers] = useState<string[]>(["1", "2", "3", "4", "5", "6", "7", "8"]);
  const [combinations, setCombinations] = useState<string[][][]>([]);
// PLayer matrix = {name: string, plays: [{opponent: string, count: number, result: [string]}]}
  const [playerMatrix, setPlayerMatrix] = useState<{name: string, plays: {opponent: string, count: number, result: string[]}[]}[]>([]);
  
  useEffect(() => {
    let combi = calculate(players);
    setCombinations(combi);
  }, [players]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Button className="mb-4" >Button</Button>
      <div className="flex flex-col gap-2">
        {combinations.map((combination, index) => (
          <div key={index} className="flex gap-2">
            {combination.map((player, index) => (
              <div key={index} className="flex items-center justify-center w-24 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                {player[0]} - {player[1]}
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
