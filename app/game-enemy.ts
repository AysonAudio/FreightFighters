import type { Panel, EnemyClickEvent, ActionClickEvent } from "./game-ui";

import { GetBuildingCache } from "./game-building.js";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export type Enemy = Panel & {
    name: string;
    artURI: string;
    hitChance: number;
    hitDamage: number;
};

export type EnemyMsg = {
    enemy: Enemy;
    index: number;
};

export type EnemyEvent = CustomEvent<EnemyMsg>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** A JSON object containing enemy types. */
interface EnemyJSON {
    [key: string]: Enemy;
}

/** All enemy types in /data/enemy.json. */
export interface EnemyData {
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
 * Listen for panel action event:
 * - Kill specified enemy.
 * - Clear selected enemy index.
 * - Dispatch a {@link EnemyEvent} named "kill_enemy".
 */
function ListenActionEvents() {
    const cache = GetEnemyCache();
    window.addEventListener("click_action", (e: ActionClickEvent) => {
        if (e.detail.action?.kill) {
            cache.enemies.splice(e.detail.buttonIndex, 1);
            cache.selected = undefined;
            window.dispatchEvent(
                new CustomEvent<EnemyMsg>("kill_enemy", {
                    detail: {
                        enemy: e.detail.enemy,
                        index: e.detail.buttonIndex,
                    },
                })
            );
        }
    });
}

/**
 * Init all Enemy systems.
 * Load JSON files.
 * Run this once at game start.
 */
export async function Init(): Promise<boolean> {
    ListenClickEvents();
    ListenActionEvents();
    return LoadTypes();
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Spawn a new Enemy.
 * Dispatch a {@link EnemyEvent} named "spawn_enemy".
 * Does nothing if 4 enemies already exist.
 */
export function SpawnEnemy(type: Enemy) {
    const cache = GetEnemyCache();
    if (cache.enemies.length >= 4) return;
    cache.enemies.push(type);
    window.dispatchEvent(
        new CustomEvent<EnemyMsg>("spawn_enemy", {
            detail: {
                enemy: type,
                index: cache.enemies.length - 1,
            },
        })
    );
}
