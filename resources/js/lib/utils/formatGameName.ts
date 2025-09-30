export function formatGameName(gameId: string): string {
    if (gameId.toLowerCase() === 'cs2') return 'CS2';

    // Capitalize first letter of each word
    return gameId
        .split(/[-_\s]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
