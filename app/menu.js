/**
 * A decorator factory.
 * Manages one global {@link MenuCache} object and passes it to functions.
 */
const CACHE = (() => {
    const cache = {
        playButton: document.body.querySelector("#main-menu > .buttons > .play"),
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
const PlayGame = CACHE((cache) => {
    cache.mainMenuDiv.style.display = "none";
    cache.gameDiv.style.display = "";
    document.body.dispatchEvent(new Event("play"));
});
// ========================================================================== //
/**
 * Init buttons.
 */
export const InitMenu = CACHE((cache) => {
    cache.playButton.onclick = () => PlayGame();
});
