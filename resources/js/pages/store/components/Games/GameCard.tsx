import React from 'react';
import { Game } from '../../types';

export default function GameCard({ game }: { game: Game }) {
  return (
    <div className="group w-[320px] h-[180px] rounded-2xl overflow-hidden shadow-xl bg-black/40 flex flex-col justify-end relative cursor-pointer transition-all">
      <img
        src={game.image}
        alt={game.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 transition-all duration-300 bg-black/0 group-hover:bg-black/60 group-hover:backdrop-blur-sm flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-bold text-2xl drop-shadow-lg text-center">
          {game.name}
        </span>
      </div>
      {/* Optional: keep gradient for bottom fade */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-black/80 to-transparent"></div>
    </div>
  );
}
