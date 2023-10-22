/** Variables cached in memory for quick access. */
type MenuCache = {
    /** Main Menu container elem. Hidden when Play Game is clicked. */
    mainMenuDiv: HTMLDivElement;
    /** Game container elem. Unhidden when Play Game is clicked. */
    gameDiv: HTMLDivElement;
    /** Play Game button. */
    playButton: HTMLButtonElement;
};

/** A function that needs access to a cached variable. */
type MenuFunc<Return> = (cache: MenuCache, ...args) => Return;

/**
 * A decorated function.
 * One global {@link MenuCache} object is initialized in the decorator.
 * Calling the resulting function returns the same object every time.
 */
export const GetMenuCache: () => MenuCache = (() => {
    const cache: MenuCache = {
        mainMenuDiv: document.body.querySelector("#main-menu"),
        gameDiv: document.body.querySelector("#game"),
        playButton: document.body.querySelector(
            "#main-menu > .buttons > .play"
        ),
    };
    return () => cache;
})();

// ========================================================================== //

/**
 * Set onclick for Play Game button.
 * - Hide Main Menu.
 * - Unhide Game.
 * - Dispatch "play" event.
 */
export function Init() {
    const cache = GetMenuCache();
    cache.playButton.onclick = () => {
        cache.mainMenuDiv.style.display = "none";
        cache.gameDiv.style.display = "";
        window.dispatchEvent(new Event("play"));
    };
}
