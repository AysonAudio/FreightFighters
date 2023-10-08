/**
 * A decorator factory.
 * Manages one global {@link MenuCache} object and passes it to functions.
 */
const MENU = (() => {
    const globalMenuCache = {
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
const PlayGame = MENU((cache) => {
    if (cache.mainMenuElem)
        cache.mainMenuElem.style.display = "none";
});
// ========================================================================== //
/**
 * Init buttons.
 */
export const InitMenu = MENU((cache) => {
    if (cache.playGameElem)
        cache.playGameElem.onclick = () => PlayGame();
});
