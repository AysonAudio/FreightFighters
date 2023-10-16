/** Global inventory variables. */
type GameInventoryCache = {
    /** How much tools the player has. */
    tools: number;
};

/** A function that needs access to a cached variable. */
type GameInventoryFunc<Return> = (cache: GameInventoryCache, ...args) => Return;

/** A custom event that passes the cache. */
export type GameInventoryEvent = CustomEvent<GameInventoryCache>;

/**
 * A decorator factory.
 * Manages one global {@link GameUiCache} object and passes it to functions.
 */
const CACHE: <Return>(func: GameInventoryFunc<Return>) => (...args) => Return =
    (() => {
        const cache: GameInventoryCache = {
            tools: 0,
        };

        return (func) => {
            return (...args) => func(cache, ...args);
        };
    })();

// ========================================================================== //

/**
 * Increment tools (or decrement if amount is negative).
 * Dispatch a {@link GameInventoryEvent} named "onGainTools".
 */
export const GainTools: (amount: number) => void = CACHE(
    (cache: GameInventoryCache, amount: number) => {
        cache.tools += amount;
        document.body.dispatchEvent(
            new CustomEvent("onGainTools", { detail: cache })
        );
    }
);
