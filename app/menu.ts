/** All global variables to cache when the game is loaded. */
type MenuCache = {
    /** Play Game button. */
    playButton: HTMLButtonElement;
    /** Main Menu container elem. Hidden when Play Game is clicked. */
    mainMenuDiv: HTMLDivElement;
    /** Game container elem. Unhidden when Play Game is clicked. */
    gameDiv: HTMLDivElement;
};

/** A function that needs access to a global variable. */
type MenuFunc<Return> = (cache: MenuCache, ...args) => Return;

/**
 * A decorator factory.
 * Manages one global {@link MenuCache} object and passes it to functions.
 */
const CACHE: <Return>(func: MenuFunc<Return>) => (...args) => Return = (() => {
    const cache: MenuCache = {
        playButton: document.body.querySelector(
            "#main-menu > .buttons > .play"
        ),
        mainMenuDiv: document.body.querySelector("#main-menu"),
        gameDiv: document.body.querySelector("#game"),
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
    cache.mainMenuDiv.style.display = "none";
    cache.gameDiv.style.display = "";
    document.body.dispatchEvent(new Event("play"));
});

// ========================================================================== //

/**
 * Init buttons.
 */
export const InitMenu: () => void = CACHE((cache: MenuCache) => {
    cache.playButton.onclick = () => PlayGame();
});
