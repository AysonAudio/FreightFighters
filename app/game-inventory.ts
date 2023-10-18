import { GetBuildingCache } from "./game-building.js";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export type ResourceChange = {
    change: number;
    newTotal: number;
};

export type ResourceChangeEvent = CustomEvent<ResourceChange>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** Global inventory variables. */
type InventoryCache = {
    /** How much wood the player has. */
    wood: number;
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * A decorated function.
 * One global {@link InventoryCache} object is initialized in the decorator.
 * Calling the resulting function returns the same object every time.
 */
export const GetInventoryCache: () => InventoryCache = (() => {
    const cache: InventoryCache = {
        wood: 0,
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
    window.addEventListener("clickBuild", (e: CustomEvent<number>) => {
        const building = buildingCache.buildings[buildingCache.selected];
        const action = building.actions[e.detail];
        if (action.addWood) GainWood(action.addWood);
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
 * Increment wood (or decrement if amount is negative).
 * Dispatch a {@link ResourceChangeEvent} named "gainWood".
 */
export function GainWood(amount: number) {
    const cache = GetInventoryCache();
    cache.wood += amount;
    window.dispatchEvent(
        new CustomEvent<ResourceChange>("gainWood", {
            detail: {
                change: amount,
                newTotal: cache.wood,
            },
        })
    );
}
