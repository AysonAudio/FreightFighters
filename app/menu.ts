/** All global variables to cache when the game is loaded. */
type MenuCache = {
    /** Main Menu container elem. Hidden when Play Game is clicked. */
    mainMenuElem: HTMLDivElement;
    /** Play Game button. */
    playElem: HTMLButtonElement;
    /** Game container elem. Unhidden when Play Game is clicked. */
    gameElem: HTMLDivElement;
};

/** A function that needs access to a global variable. */
type MenuFunc<Return> = (cache: MenuCache, ...args) => Return;

/**
 * A decorator factory.
 * Manages one global {@link MenuCache} object and passes it to functions.
 */
const CACHE: <Return>(func: MenuFunc<Return>) => (...args) => Return = (() => {
    const cache: MenuCache = {
        mainMenuElem: document.body.querySelector("#main-menu"),
        playElem: document.body.querySelector("#main-menu > .buttons > .play"),
        gameElem: document.body.querySelector("#game"),
    };

    return (func) => {
        return (...args) => func(cache, ...args);
    };
})();

// ========================================================================== //

/**
 * Hide Main Menu.
 * Unhide game.
 * Dispatch "play" event on document.body.
 */
const PlayGame: () => void = CACHE((cache: MenuCache) => {
    cache.mainMenuElem.style.display = "none";
    cache.gameElem.style.display = "";
    document.body.dispatchEvent(new Event("play"));
});

// ========================================================================== //

/**
 * Init buttons.
 */
export const InitMenu: () => void = CACHE((cache: MenuCache) => {
    cache.playElem.onclick = () => PlayGame();
});
