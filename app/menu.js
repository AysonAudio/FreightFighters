/**
 * A decorator factory.
 * Manages one global {@link MenuCache} object and passes it to functions.
 */
const CACHE = (() => {
    const cache = {
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
const PlayGame = CACHE((cache) => {
    cache.mainMenuElem.style.display = "none";
    cache.gameElem.style.display = "";
    document.body.dispatchEvent(new Event("play"));
});
// ========================================================================== //
/**
 * Init buttons.
 */
export const InitMenu = CACHE((cache) => {
    cache.playElem.onclick = () => PlayGame();
});
