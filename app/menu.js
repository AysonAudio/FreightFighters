/**
 * A decorator factory.
 * Manages one global {@link MenuCache} object and passes it to functions.
 */
const CACHE = (() => {
    const cache = {
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
const PlayGame = CACHE((cache) => {
    cache.mainMenuDiv.style.display = "none";
    cache.gameDiv.style.display = "";
    document.body.dispatchEvent(new Event("play"));
});
// ========================================================================== //
/**
 * Program Main Menu buttons.
 */
export function InitMenu() {
    const playButton = document.body.querySelector("#main-menu > .buttons > .play");
    playButton.onclick = () => PlayGame();
}
