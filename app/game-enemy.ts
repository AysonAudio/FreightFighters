import type { Panel, ActionClickEvent } from "./game-ui";
import type { NumChangeEvent } from "./game-player";

import { GetBuildingCache } from "./game-building.js";
import { AdjustNum } from "./game-player.js";
import { GetCacheUI } from "./game-ui.js";

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
export type SpawnEnemiesEvent = CustomEvent<EnemyMsg[]>;

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

    /**
     * Key = index of an enemy that was just spawned.
     * These enemies dont attack on the same day they were spawned.
     */
    recentSpawns: (true | undefined)[];
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

        recentSpawns: [],
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
 * Spawn new enemies.
 * Flag them as recently spawned so they dont attack for one game day.
 * Dispatch a {@link SpawnEnemiesEvent} named "spawn_enemies".
 * Max 4 enemies alive at once.
 */
export function SpawnEnemy(type: Enemy, amount: number = 1) {
    const cache = GetEnemyCache();
    let msgs: EnemyMsg[] = [];

    for (let i = 0; i < amount; i++) {
        if (cache.enemies.length >= 4) break;
        const newEnemyIndex = cache.enemies.length;

        cache.enemies.push(type);
        cache.recentSpawns[newEnemyIndex] = true;
        msgs.push({
            enemy: type,
            index: newEnemyIndex,
        });
    }
    if (msgs.length <= 0) return;

    window.dispatchEvent(
        new CustomEvent<EnemyMsg[]>("spawn_enemies", { detail: msgs })
    );
}

/**
 * Make an enemy roll for hitChance once.
 * If successful, do hitDamage and play attack anim.
 */
export function RollEnemyAttack(enemyIndex: number) {
    const cacheEnemy = GetEnemyCache();
    const cacheUI = GetCacheUI();
    const enemy = cacheEnemy.enemies[enemyIndex];
    const card = cacheUI.fightBarDiv.children[enemyIndex];
    const roll = Math.random() * 100;

    // Skip enemies that were just spawned on this game day
    if (cacheEnemy.recentSpawns[enemyIndex]) {
        cacheEnemy.recentSpawns[enemyIndex] = undefined;
        return;
    }

    if (roll < enemy.hitChance) {
        AdjustNum("hp", -enemy.hitDamage);
        card.animate(
            [
                // Use transform instead of translate,
                // to allow other simultaneous anims
                { transform: "translateY(0)" },
                { transform: "translateY(-10vh)" },
                { transform: "translateY(0)" },
            ],
            {
                easing: "cubic-bezier(0, 0.8, 0.2, 1)",
                duration: 500,
                iterations: 1,
            }
        );
    }
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
    window.addEventListener("click_enemy", (e: EnemyEvent) => {
        enemyCache.selected = e.detail.index;
        buildingCache.selected = undefined;
    });
}

/**
 * Listen for panel action event:
 * - If action is to kill selected enemy:
 *     - Splice enemy and RecentSpawn flag.
 *     - Clear selected enemy index.
 *     - Dispatch a {@link EnemyEvent} named "kill_enemy".
 *
 */
function ListenActionEvents() {
    const cache = GetEnemyCache();
    window.addEventListener("click_action", (e: ActionClickEvent) => {
        if (e.detail.action?.kill) {
            cache.enemies.splice(e.detail.buttonIndex, 1);
            cache.recentSpawns.splice(e.detail.buttonIndex, 1);
            window.dispatchEvent(
                new CustomEvent<EnemyMsg>("kill_enemy", {
                    detail: {
                        enemy: e.detail.enemy,
                        index: cache.selected,
                    },
                })
            );
            cache.selected = undefined;
        }
    });
}

/**
 * Listen for player variable change events:
 * - If game day changes, make all enemies roll for attack.
 * - Newly spawned enemies dont attack the day they're spawned.
 */
function ListenResourceEvents() {
    const cache = GetEnemyCache();
    window.addEventListener("adjustCurr", (e: NumChangeEvent) => {
        if (e.detail.key != "days") return;
        for (let i = 0; i < cache.enemies.length; i++) RollEnemyAttack(i);
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
    ListenResourceEvents();
    return LoadTypes();
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
