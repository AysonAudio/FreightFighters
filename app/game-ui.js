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
        newTurnElem: document.body.querySelector("#new-turn"),
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
    addedEnemy.animate([{ transform: "translateX(100vw)" }, { transform: "translateX(0)" }], {
        easing: "cubic-bezier(0.42, 0, 0.58, 1)",
        duration: 1000,
        iterations: 1,
    });
});
/**
 * Show toast when new turn starts.
 */
export const ShowNewTurn = CACHE((cache, turn) => {
    const title = cache.newTurnElem.children[1];
    title.innerHTML = "Day " + turn.toString();
    cache.newTurnElem.animate([
        { opacity: "0" },
        { opacity: "100" },
        { opacity: "100" },
        { opacity: "0" },
    ], {
        duration: 1500,
        iterations: 1,
    });
});
