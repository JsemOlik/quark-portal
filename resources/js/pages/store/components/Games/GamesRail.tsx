import React from 'react';
import { Game } from '../../types';
import MarqueeRow from './MarqueeRow';

const games: Game[] = [
    {
        id: 'cs2',
        name: 'Counter Strike 2',
        image: '/images/games/cs2.jpg',
    },
    {
        id: 'minecraft',
        name: 'Minecraft',
        image: '/images/games/minecraft.png',
    },
    {
        id: 'palworld',
        name: 'Palworld',
        image: '/images/games/palworld.webp',
    },
    {
        id: 'terraria',
        name: 'Terraria',
        image: '/images/games/terraria.jpg',
    },
    {
        id: 'rust',
        name: 'Rust',
        image: '/images/games/rust.jpg',
    },
    {
        id: 'arma',
        name: 'Arma Reforger',
        image: '/images/games/arma.jpg',
    },
    {
        id: 'bermuda',
        name: 'Beasts of Bermuda',
        image: '/images/games/bermuda.webp',
    },
    {
        id: 'soulmask',
        name: 'Soulmask',
        image: '/images/games/soulmask.png',
    },
    {
        id: 'isle',
        name: 'The Isle',
        image: '/images/games/isle.jpg',
    },
    {
        id: 'garrysmod',
        name: 'Garry\'s Mod',
        image: '/images/games/garrysmod.jpg',
    },
    {
        id: 'astroneer',
        name: 'Astroneer',
        image: '/images/games/astroneer.jpg',
    },
    {
        id: '7dtd',
        name: '7 Days to Die',
        image: '/images/games/7dtd.jpg',
    },
    {
        id: 'valheim',
        name: 'Valheim',
        image: '/images/games/valheim.jpg',
    },
    {
        id: 'tf2',
        name: 'Team Fortress 2',
        image: '/images/games/tf2.jpg',
    },
];

const half = Math.ceil(games.length / 2);
const topGames = games.slice(0, half);
const bottomGames = games.slice(half);

export default function GamesRail() {
    return (
        <>
            {/* Full-width aligned SVG line grid */}
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 h-full w-full text-brand-cream"
                style={{
                    maskImage:
                        'linear-gradient(to bottom, black 0%, black 0%, transparent 100%)',
                    WebkitMaskImage:
                        'linear-gradient(to bottom, black 0%, black 0%, transparent 100%)',
                }}
            >
                <defs>
                    <pattern
                        id="grid-24"
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                    >
                        <path
                            d="M0.5 24V0.5H24"
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity="0.05"
                        />
                    </pattern>
                    <g id="grid-pass">
                        <rect width="100%" height="100%" fill="url(#grid-24)" />
                    </g>
                </defs>
                <use href="#grid-pass" opacity="0.05" />
                <g transform="scale(-1 1) translate(-100%,0)">
                    <use href="#grid-pass" opacity="0.10" />
                </g>
            </svg>

            <div className="space-y-6">
                <MarqueeRow direction="left" items={topGames} />
                <MarqueeRow direction="right" items={bottomGames} />
            </div></>
    );
}
