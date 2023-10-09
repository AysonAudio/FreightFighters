/**
 * A decorator factory.
 * Manages one global {@link GameBuildingsCache} object and passes it to functions.
 */
const CACHE = (() => {
    const cache = {
        gridElem: document.body.querySelector("#game > .grid"),
        buildPanelElem: document.body.querySelector("#game > #build"),
        fightElem: document.body.querySelector("#game > #fight"),
        enemyTemplate: document.body.querySelector("#enemy"),
    };
    return (func) => {
        return (...args) => func(cache, ...args);
    };
})();
// ========================================================================== //
/**
 * Click grid button.
 * Show building details and options.
 */
const ShowPanel = CACHE((cache) => {
    cache.buildPanelElem.style.display = "";
});
// ========================================================================== //
/**
 * Init grid buttons.
 */
export const InitGrid = CACHE((cache) => {
    for (const buttonElem of cache.gridElem
        .children)
        buttonElem.onclick = () => ShowPanel();
});
/**
 * Create enemy card in #fight.
 */
export const AddEnemy = CACHE((cache) => {
    cache.fightElem.appendChild(cache.enemyTemplate.content.cloneNode(true));
});
