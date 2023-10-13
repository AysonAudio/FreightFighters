/**
 * A decorator factory.
 * Manages one global {@link GameUiCache} object and passes it to functions.
 */
const CACHE = (() => {
    const cache = {
        gridDiv: document.body.querySelector("#game > .grid"),
        buildPanelDiv: document.body.querySelector("#game > #build"),
        combatPanelDiv: document.body.querySelector("#game > #combat"),
        fightDiv: document.body.querySelector("#game > #fight"),
        tools: 0,
        toolSpan: document.body.querySelector("#game > .dashboard > #tools"),
        gameDayDiv: document.body.querySelector("#new-turn"),
        enemyTemplate: document.body.querySelector("#enemy"),
    };
    return (func) => {
        return (...args) => func(cache, ...args);
    };
})();
// ========================================================================== //
/**
 * Click grid button.
 * Show building details and actions.
 * Hide other panels.
 */
const ShowBuildPanel = CACHE((cache) => {
    cache.buildPanelDiv.style.display = "";
    cache.combatPanelDiv.style.display = "none";
});
/**
 * Click fight card.
 * Show combat details and actions.
 * Hide other panels.
 */
const ShowCombatPanel = CACHE((cache) => {
    cache.combatPanelDiv.style.display = "";
    cache.buildPanelDiv.style.display = "none";
});
// ========================================================================== //
/**
 * Init grid buttons.
 */
export const InitGrid = CACHE((cache) => {
    for (const buttonElem of cache.gridDiv
        .children)
        buttonElem.onclick = () => ShowBuildPanel();
});
/**
 * Create enemy card in #fight.
 */
export const AddEnemy = CACHE((cache) => {
    cache.fightDiv.appendChild(cache.enemyTemplate.content.cloneNode(true));
    const addedEnemy = cache.fightDiv.lastElementChild;
    addedEnemy.onclick = () => ShowCombatPanel();
    addedEnemy.animate([{ transform: "translateX(100vw)" }, { transform: "translateX(0)" }], {
        easing: "cubic-bezier(0, 1, 0.4, 1)",
        duration: 1000,
        iterations: 1,
    });
});
/**
 * Show toast when game days pass.
 */
export const ShowGameDay = CACHE((cache, turn) => {
    const title = cache.gameDayDiv.children[1];
    title.innerHTML = "Day " + turn.toString();
    cache.gameDayDiv.animate([
        { opacity: "0" },
        { opacity: "100" },
        { opacity: "100" },
        { opacity: "0" },
    ], {
        easing: "cubic-bezier(0, 0.2, 1, 1)",
        duration: 1800,
        iterations: 1,
    });
});
/**
 * Increment tools.
 */
export const AddTools = CACHE((cache, added) => {
    cache.toolSpan.innerHTML = "⚒️" + (cache.tools + added).toString();
});
