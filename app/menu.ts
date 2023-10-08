/** All global menu variables to cache when the game is loaded. */
type MenuCache = {
    /** Main Menu container elem. Hidden when Play Game is clicked. */
    mainMenuElem: HTMLDivElement | null;
    /** Play Game button. */
    playGameElem: HTMLButtonElement | null;
};

/** A function that needs access to a global menu variable. */
type GameFunc<Return> = (cache: MenuCache, ...args) => Return;

/**
 * A decorator factory.
 * Manages one global {@link MenuCache} object and passes it to functions.
 */
const MENU: <Return>(func: GameFunc<Return>) => (...args) => Return = (() => {
    const globalMenuCache: MenuCache = {
        mainMenuElem: document.querySelector("#main-menu"),
        playGameElem: document.querySelector("#main-menu > .buttons > .play"),
    };

    return (func) => {
        return (...args) => func(globalMenuCache, ...args);
    };
})();

// ========================================================================== //

/**
 * Hide Main Menu.
 * Unhide game.
 */
const PlayGame: () => void = MENU((cache: MenuCache) => {
    if (cache.mainMenuElem) cache.mainMenuElem.style.display = "none";
});

// ========================================================================== //

/**
 * Init buttons.
 */
export const InitMenu: () => void = MENU((cache: MenuCache) => {
    if (cache.playGameElem) cache.playGameElem.onclick = () => PlayGame();
});
