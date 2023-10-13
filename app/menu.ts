/** Variables cached in memory for quick access. */
type MenuCache = {
    /** Main Menu container elem. Hidden when Play Game is clicked. */
    mainMenuDiv: HTMLDivElement;
    /** Game container elem. Unhidden when Play Game is clicked. */
    gameDiv: HTMLDivElement;
};

/** A function that needs access to a cached variable. */
type MenuFunc<Return> = (cache: MenuCache, ...args) => Return;

/**
 * A decorator factory.
 * Manages one global {@link MenuCache} object and passes it to functions.
 */
const CACHE: <Return>(func: MenuFunc<Return>) => (...args) => Return = (() => {
    const cache: MenuCache = {
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
 * Unhide Game.
 * Dispatch "play" event on document.body.
 */
const PlayGame: () => void = CACHE((cache: MenuCache) => {
    cache.mainMenuDiv.style.display = "none";
    cache.gameDiv.style.display = "";
    document.body.dispatchEvent(new Event("play"));
});

// ========================================================================== //

/**
 * Program Main Menu buttons.
 */
export function InitMenu() {
    const playButton: HTMLButtonElement = document.body.querySelector(
        "#main-menu > .buttons > .play"
    );
    playButton.onclick = () => PlayGame();
}
