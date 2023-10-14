/**
 * A decorator factory.
 * Manages one global {@link GameUiCache} object and passes it to functions.
 */
const CACHE = (() => {
    const cache = {
        buildPanelDiv: document.body.querySelector("#game > #build"),
        combatPanelDiv: document.body.querySelector("#game > #combat"),
        fightBarDiv: document.body.querySelector("#game > #fight"),
        enemyTemplate: document.body.querySelector("#enemy"),
        tools: 0,
        toolSpan: document.body.querySelector("#game > .dashboard > #tools"),
        newDayDiv: document.body.querySelector("#new-day"),
    };
    return (func) => {
        return (...args) => func(cache, ...args);
    };
})();
// ========================================================================== //
/**
 * Click building button.
 * Show details and actions on build panel.
 * Hide other panels.
 */
const ShowBuildPanel = CACHE((cache) => {
    cache.buildPanelDiv.style.display = "";
    cache.combatPanelDiv.style.display = "none";
});
/**
 * Click enemy card.
 * Show details and actions on combat panel.
 * Hide other panels.
 */
const ShowCombatPanel = CACHE((cache) => {
    cache.combatPanelDiv.style.display = "";
    cache.buildPanelDiv.style.display = "none";
});
// ========================================================================== //
/**
 * Program Building Grid buttons.
 */
export function InitGrid() {
    const gridDiv = document.body.querySelector("#game > .grid");
    const buttons = gridDiv.children;
    let i = 0;
    /** Show and update build panel when clicking a Building Grid button. */
    function registerEvent(button, buttonIndex) {
        const event = new CustomEvent("updateBuildPanel", {
            detail: { clickedButtonIndex: buttonIndex },
        });
        button.onclick = () => {
            ShowBuildPanel();
            document.body.dispatchEvent(event);
        };
    }
    for (const button of buttons) {
        registerEvent(button, i);
        i++;
    }
}
/**
 * Show toast when game days pass.
 */
export const ShowGameDay = CACHE((cache, day) => {
    const title = cache.newDayDiv.children[1];
    title.innerHTML = "Day " + day.toString();
    cache.newDayDiv.animate([
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
 * Spawn enemy card in fight bar.
 */
export const AddEnemy = CACHE((cache) => {
    cache.fightBarDiv.appendChild(cache.enemyTemplate.content.cloneNode(true));
    const addedEnemy = cache.fightBarDiv.lastElementChild;
    addedEnemy.onclick = () => ShowCombatPanel();
    addedEnemy.animate([{ transform: "translateX(100vw)" }, { transform: "translateX(0)" }], {
        easing: "cubic-bezier(0, 1, 0.4, 1)",
        duration: 1000,
        iterations: 1,
    });
});
/**
 * Increment player tools.
 */
export const AddTools = CACHE((cache, added) => {
    cache.toolSpan.innerHTML = "⚒️" + (cache.tools + added).toString();
});
