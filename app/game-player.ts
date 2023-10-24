import type { ExactlyOne } from "./util";

import { GetBuildingCache } from "./game-building.js";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export type Counter = {
    title: string;
    desc: string;
    emblem: string;
} & ExactlyOne<{
    key: string;
    number: number;
}>;

/** A JSON object containing counters. */
interface CounterJSON {
    [key: string]: Counter;
}

/** All counters in /data/counter.json. */
interface CounterData extends CounterJSON {
    hp?: Counter;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** Number variables. */
export type PlayerNums = {
    /** Game days. */
    days: number;
    /** Player health points. */
    hp: number;
    /** Player wood resources. */
    wood: number;
};

export type NumChange = {
    key: string;
    change: number;
    newTotal: number;
};

export type NumChangeEvent = CustomEvent<NumChange>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** Global player variables. */
type PlayerCache = {
    current: PlayerNums;
    min: PlayerNums;
    max: PlayerNums;

    /** All counters in /data/counter.json. */
    counters: CounterData;
    /** True if counters are loaded. */
    areCountersLoaded: boolean;
};

/**
 * A decorated function.
 * One global {@link PlayerCache} object is initialized in the decorator.
 * Calling the resulting function returns the same object every time.
 */
export const GetPlayerCache: () => PlayerCache = (() => {
    const cache: PlayerCache = {
        current: {
            days: 1,
            hp: 2,
            wood: 0,
        },
        min: {
            days: 1,
            hp: 0,
            wood: 0,
        },
        max: {
            days: 888,
            hp: 4,
            wood: 888,
        },

        counters: {},
        areCountersLoaded: false,
    };

    return () => cache;
})();

/**
 * Load counters from /data/counter.json into cache.
 */
async function LoadCounters(): Promise<boolean> {
    const cache = GetPlayerCache();
    if (cache.areCountersLoaded) return false;
    return fetch("../data/counter.json")
        .then((response) => response.json())
        .then((json: { counters: CounterData }) => {
            cache.counters = json.counters;
            cache.areCountersLoaded = true;
            return true;
        });
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Listen for panel action events.
 * - Update player resources.
 */
function ListenClickEvents() {
    const playerCache = GetPlayerCache();
    const buildingCache = GetBuildingCache();

    window.addEventListener("click_action", (e: CustomEvent<number>) => {
        const building = buildingCache.buildings[buildingCache.selected];
        const action = building.actions[e.detail];

        for (const key in action.min)
            if (playerCache.current[key] < action.min[key]) return;
        for (const key in action.max)
            if (playerCache.current[key] >= action.max[key]) return;

        if (action.adjust) {
            for (const key in action.adjust) AdjustNum(key, action.adjust[key]);
        }
    });
}

/**
 * Init all inventory systems.
 * Run this once at game start.
 */
export async function Init(): Promise<boolean> {
    ListenClickEvents();
    return LoadCounters();
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Adjust a player resource or game variable, by a positive or negative amount.
 * Dispatch a {@link NumChangeEvent} named "adjust".
 */
export function AdjustNum(key: string, amount: number) {
    const cache = GetPlayerCache();

    cache.current[key] += amount;
    if (cache.current[key] > cache.max[key])
        cache.current[key] = cache.max[key];
    if (cache.current[key] < cache.min[key])
        cache.current[key] = cache.min[key];

    window.dispatchEvent(
        new CustomEvent<NumChange>("adjust", {
            detail: {
                key: key,
                change: amount,
                newTotal: cache.current[key],
            },
        })
    );
}
