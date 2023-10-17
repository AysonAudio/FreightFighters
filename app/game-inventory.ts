export type ResourceChange = {
    change: number;
    newTotal: number;
};

export type ResourceChangeEvent = CustomEvent<ResourceChange>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** Global inventory variables. */
type InventoryCache = {
    /** How much tools the player has. */
    tools: number;
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
        tools: 0,
    };
    return () => cache;
})();

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Increment tools (or decrement if amount is negative).
 * Dispatch a {@link ResourceChangeEvent} named "gainTools".
 */
export function GainTools(amount: number) {
    const cache = GetInventoryCache();
    cache.tools += amount;
    window.dispatchEvent(
        new CustomEvent<ResourceChange>("gainTools", {
            detail: {
                change: amount,
                newTotal: cache.tools,
            },
        })
    );
}
