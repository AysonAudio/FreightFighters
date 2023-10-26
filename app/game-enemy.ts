import type { Panel, EnemyClickEvent } from "./game-ui";

import { GetBuildingCache } from "./game-building.js";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export type Enemy = Panel & {
    name: string;
    artURI: string;
    hitChance: number;
    hitDamage: number;
};

export type EnemySpawn = {
    enemy: Enemy;
    index: number;
};

export type EnemySpawnEvent = CustomEvent<EnemySpawn>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** A JSON object containing enemy types. */
interface EnemyJSON {
    [key: string]: Enemy;
}

/** All enemy types in /data/enemy.json. */
interface EnemyData extends EnemyJSON {
    zombie?: Enemy;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** Global enemy variables. */
type EnemyCache = {
    /** Index of currently selected enemy. Undefined if nothing selected. */
    selected: number | undefined;
    /** Spawned enemies. */
    enemies: Enemy[];

    /** All enemy types in /data/enemy.json. */
    enemyTypes: EnemyData;
    /** True if enemyTypes are loaded. */
    areTypesLoaded: boolean;
};

/**
 * A decorated function.
 * One global {@link EnemyCache} object is initialized in the decorator.
 * Calling the resulting function returns the same object every time.
 */
export const GetEnemyCache: () => EnemyCache = (() => {
    let cache: EnemyCache = {
        selected: undefined,
        enemies: [],

        enemyTypes: {},
        areTypesLoaded: false,
    };
    return () => cache;
})();

/**
 * Load enemy types from /data/enemy.json into cache.
 */
async function LoadTypes(): Promise<boolean> {
    const cache = GetEnemyCache();
    if (cache.areTypesLoaded) return false;
    return fetch("../data/enemy.json")
        .then((response) => response.json())
        .then((json: EnemyData) => {
            cache.enemyTypes = json;
            cache.areTypesLoaded = true;
            return true;
        });
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Listen for button click event:
 * - Update selected enemy index.
 * - Clear other selections (buildings, etc).
 */
function ListenClickEvents() {
    const enemyCache = GetEnemyCache();
    const buildingCache = GetBuildingCache();
    window.addEventListener("click_enemy", (e: EnemyClickEvent) => {
        enemyCache.selected = e.detail.buttonIndex;
        buildingCache.selected = undefined;
    });
}

/**
 * Init all Enemy systems.
 * Run this once at game start.
 */
export async function Init(): Promise<boolean> {
    ListenClickEvents();
    return LoadTypes();
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Spawn a new Enemy.
 * Dispatch a {@link EnemySpawnEvent} named "spawn_enemy".
 */
export function SpawnEnemy(type: Enemy) {
    const cache = GetEnemyCache();
    cache.enemies.push(type);
    window.dispatchEvent(
        new CustomEvent<EnemySpawn>("spawn_enemy", {
            detail: {
                enemy: type,
                index: cache.enemies.length - 1,
            },
        })
    );
}
