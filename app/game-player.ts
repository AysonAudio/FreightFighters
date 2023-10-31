import type { ExactlyOne } from "./util";
import type { ActionEvent } from "./game-ui";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export type Counter = {
    tooltip: string;
    emblem: string;
} & ExactlyOne<{
    key: string;
    number: number;
}>;
export type CounterMsg = {
    counter: Counter;
    index: number;
};
export type CounterEvent = CustomEvent<CounterMsg>;

/** A JSON object containing counters. */
interface CounterJSON {
    [key: string]: Counter;
}

/** All counters in /data/counter.json. */
interface CounterData {
    hp?: Counter;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export type GameNums = {
    /** Game days. */
    days: number;
};
export type PlayerNums = {
    /** Player health points. */
    hp: number;
    /** Player wood resources. */
    wood: number;
    /** Player troops resources. */
    troops: number;
};
export type NumVars = GameNums & PlayerNums;

export type NumChange = {
    key: keyof NumVars;
    change: number;
    newTotal: number;
};
export type NumChangeEvent = CustomEvent<NumChange>;

export type RenewChange = {
    key: keyof PlayerNums;
    change: number;
    newTotal: number;
};
export type RenewChangeEvent = CustomEvent<RenewChange>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** Global player variables. */
type PlayerCache = {
    current: NumVars;
    min: PlayerNums;
    max: PlayerNums;

    /** On day end, if current < renew, set current to renew. */
    renew: PlayerNums;

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
            days: 0,
            hp: 2,
            wood: 0,
            troops: 2,
        },
        min: {
            hp: 0,
            wood: 0,
            troops: 0,
        },
        max: {
            hp: 4,
            wood: 888,
            troops: 888,
        },
        renew: {
            hp: 0,
            wood: 0,
            troops: 2,
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
        .then((json: CounterData) => {
            cache.counters = json;
            cache.areCountersLoaded = true;
            return true;
        });
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Adjust a player resource or game variable, by a positive or negative amount.
 * Dispatch a {@link NumChangeEvent} named "adjustCurr".
 */
export function AdjustNum(key: keyof NumVars, amount: number) {
    const cache = GetPlayerCache();

    cache.current[key] += amount;
    if (cache.current[key] > cache.max[key])
        cache.current[key] = cache.max[key];
    if (cache.current[key] < cache.min[key])
        cache.current[key] = cache.min[key];

    window.dispatchEvent(
        new CustomEvent<NumChange>("adjustCurr", {
            detail: {
                key: key,
                change: amount,
                newTotal: cache.current[key],
            },
        })
    );
}

/**
 * Adjust the amount of resources renewed on day end, by a positive or negative amount.
 * Dispatch a {@link RenewChangeEvent} named "adjustRenew".
 */
export function AdjustRenew(key: keyof PlayerNums, amount: number) {
    const cache = GetPlayerCache();
    cache.renew[key] += amount;
    window.dispatchEvent(
        new CustomEvent<RenewChange>("adjustRenew", {
            detail: {
                key: key,
                change: amount,
                newTotal: cache.renew[key],
            },
        })
    );
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Listen for panel action events.
 * - Adjust number variables.
 * - If game day changes, add resources if current is less than renew
 */
function ListenClickEvents() {
    const cache = GetPlayerCache();
    window.addEventListener("click_action", (e: ActionEvent) => {
        const adjustRenew = e.detail.action.adjustRenew;
        const adjustCurr = e.detail.action.adjustCurr;

        for (const key in adjustRenew)
            AdjustRenew(key as keyof PlayerNums, adjustRenew[key]);

        for (const key in adjustCurr) {
            AdjustNum(key as keyof NumVars, adjustCurr[key]);
            if (key == "days")
                for (const key2 in cache.renew)
                    if (cache.current[key2] < cache.renew[key2]) {
                        const change = cache.renew[key2] - cache.current[key2];
                        AdjustNum(key2 as keyof NumVars, change);
                    }
        }
    });
}

/**
 * Init all inventory systems.
 * Load JSON files.
 * Run this once at game start.
 */
export async function Init(): Promise<boolean> {
    ListenClickEvents();
    return LoadCounters();
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
