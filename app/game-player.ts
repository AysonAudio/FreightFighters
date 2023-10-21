import { GetBuildingCache } from "./game-building.js";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export type NumChange = {
    key: string;
    change: number;
    newTotal: number;
};

export type NumChangeEvent = CustomEvent<NumChange>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** Number variables. */
type PlayerNums = {
    /** Game days. */
    days: number;
    /** Player health points. */
    hp: number;
    /** Player wood resources. */
    wood: number;
};

/** Global player variables. */
type PlayerCache = {
    current: PlayerNums;
    min: PlayerNums;
    max: PlayerNums;
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

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
    };
    return () => cache;
})();

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Listen for building action events.
 * - Update player resources.
 */
function InitClickEvents() {
    const buildingCache = GetBuildingCache();

    window.addEventListener("click_build", (e: CustomEvent<number>) => {
        const building = buildingCache.buildings[buildingCache.selected];
        const action = building.actions[e.detail];

        if (action.adjust)
            for (const key in action.adjust) AdjustNum(key, action.adjust[key]);
    });
}

/**
 * Init all inventory systems.
 * Run this once at game start.
 */
export function Init() {
    InitClickEvents();
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Adjust a player resource or game variable, by a positive or negative amount.
 * Dispatch a {@link NumChangeEvent} named "adjust".
 */
export function AdjustNum(key: string, amount: number) {
    const playerCache = GetPlayerCache();
    const buildingCache = GetBuildingCache();

    playerCache.current[key] += amount;
    if (playerCache.current[key] > playerCache.max[key])
        playerCache.current[key] = playerCache.max[key];
    if (playerCache.current[key] < playerCache.min[key])
        playerCache.current[key] = playerCache.min[key];

    for (const building of buildingCache.buildings || [])
        for (const counter of building.counters || [])
            if (counter.key == key) counter.value = playerCache.current[key];

    window.dispatchEvent(
        new CustomEvent<NumChange>("adjust", {
            detail: {
                key: key,
                change: amount,
                newTotal: playerCache.current[key],
            },
        })
    );
}
