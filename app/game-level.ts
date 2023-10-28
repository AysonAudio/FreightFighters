import type { EnemyData } from "./game-enemy";
import type { NumChangeEvent } from "./game-player";

import { GetEnemyCache, SpawnEnemy } from "./game-enemy.js";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * A group of enemies that could be randomly selected to spawn on one game day.
 */
type SpawnGroup = {
    /** [EnemyID, SpawnAmount][] */
    spawns: [keyof EnemyData, number][];

    /**
     * Chance to pick this SpawnGroup over others =
     *  weight / total weight of all SpawnGroups in same Level
     * Use an empty SpawnGroup to have a chance of nothing spawning.
     */
    weight?: number;
};

/** Defines which enemies could randomly spawn on one game day. */
type Level = SpawnGroup[];

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** Global level variables. */
type LevelCache = {
    /** Index = game day. */
    levels: Level[];
};

/**
 * A decorated function.
 * One global {@link LevelCache} object is initialized in the decorator.
 * Calling the resulting function returns the same object every time.
 */
export const GetLevelCache: () => LevelCache = (() => {
    const cache: LevelCache = {
        levels: [
            /** Day 0 */ [{ spawns: [["zombie", 3]] }],
            /** Day 1 */ [{ spawns: [["zombie", 1]] }],
            /** Day 2 */ [{ spawns: [["zombie", 1]] }],
        ],
    };
    return () => cache;
})();

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export function SpawnLevel(level: Level | number) {
    const levelCache = GetLevelCache();
    const enemyCache = GetEnemyCache();
    let spawnGroup: SpawnGroup;
    let totalWeight = 0;
    let roll: number;
    let i = -1;

    if (typeof level === "number") level = levelCache.levels[level];
    if (!level) return;
    if (level.length == 0) return;

    for (const spawnGroup of level)
        totalWeight += spawnGroup.weight ? spawnGroup.weight : 0;
    if (totalWeight <= 0) spawnGroup = level[0];
    else {
        roll = Math.random() * totalWeight;
        do {
            i++;
            roll -= level[i].weight || 0;
        } while (roll >= 0);
        spawnGroup = level[i];
    }

    for (const spawn of spawnGroup.spawns) {
        const enemyType = enemyCache.enemyTypes[spawn[0]];
        const amount = spawn[1];
        for (let j = 0; j < amount; j++) SpawnEnemy(enemyType);
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Listen for player variable change events:
 * - If game day changes, spawn level for all elapsed game days.
 */
function ListenResourceEvents() {
    window.addEventListener("adjustCurr", (e: NumChangeEvent) => {
        if (e.detail.key == "days") {
            const dayStart = e.detail.newTotal - e.detail.change + 1;
            const dayEnd = e.detail.newTotal;
            for (let day = dayStart; day <= dayEnd; day++) SpawnLevel(day);
        }
    });
}

/**
 * Init all Level systems.
 * Run this once at game start.
 */
export function Init() {
    ListenResourceEvents();
}
