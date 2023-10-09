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
        combatPanelElem: document.body.querySelector("#combat"),
    };
    return (func) => {
        return (...args) => func(cache, ...args);
    };
})();
// ========================================================================== //
/**
 * Click grid button.
 * Show building details and options.
 * Hide other panels.
 */
const ShowBuildPanel = CACHE((cache) => {
    cache.buildPanelElem.style.display = "";
    cache.combatPanelElem.style.display = "none";
});
/**
 * Click fight card.
 * Show combat details and options.
 * Hide other panels.
 */
const ShowCombatPanel = CACHE((cache) => {
    cache.combatPanelElem.style.display = "";
    cache.buildPanelElem.style.display = "none";
});
// ========================================================================== //
/**
 * Init grid buttons.
 */
export const InitGrid = CACHE((cache) => {
    for (const buttonElem of cache.gridElem
        .children)
        buttonElem.onclick = () => ShowBuildPanel();
});
/**
 * Create enemy card in #fight.
 */
export const AddEnemy = CACHE((cache) => {
    cache.fightElem.appendChild(cache.enemyTemplate.content.cloneNode(true));
    const addedEnemy = cache.fightElem.lastElementChild;
    addedEnemy.onclick = () => ShowCombatPanel();
});
