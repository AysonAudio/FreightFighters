/** Variables cached in memory for quick access. */
type GameUiCache = {
    /**
     * An element with building details and actions.
     * Unhidden when a building is clicked on.
     */
    buildPanelDiv: HTMLDivElement;
    /**
     * An element with combat details and actions.
     * Unhidden when an enemy is clicked on.
     */
    combatPanelDiv: HTMLDivElement;

    /** An element in which all enemy cards are spawned. */
    fightBarDiv: HTMLDivElement;
    /** A template element. Cloned when a new enemy card is spawned. */
    enemyTemplate: HTMLTemplateElement;

    /** How much tools the player currently has. */
    tools: number;
    /** A span showing current tool amount. */
    toolSpan: HTMLSpanElement;

    /** A toast shown when game days pass. */
    newDayDiv: HTMLDivElement;
};

/** A function that needs access to a cached variable. */
type GameUiFunc<Return> = (cache: GameUiCache, ...args) => Return;

/**
 * A decorator factory.
 * Manages one global {@link GameUiCache} object and passes it to functions.
 */
const CACHE: <Return>(func: GameUiFunc<Return>) => (...args) => Return =
    (() => {
        const cache: GameUiCache = {
            buildPanelDiv: document.body.querySelector("#game > #build"),
            combatPanelDiv: document.body.querySelector("#game > #combat"),

            fightBarDiv: document.body.querySelector("#game > #fight"),
            enemyTemplate: document.body.querySelector("#enemy"),

            tools: 0,
            toolSpan: document.body.querySelector(
                "#game > .dashboard > #tools"
            ),

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
const ShowBuildPanel: () => void = CACHE((cache: GameUiCache) => {
    cache.buildPanelDiv.style.display = "";
    cache.combatPanelDiv.style.display = "none";
});

/**
 * Click enemy card.
 * Show details and actions on combat panel.
 * Hide other panels.
 */
const ShowCombatPanel: () => void = CACHE((cache: GameUiCache) => {
    cache.combatPanelDiv.style.display = "";
    cache.buildPanelDiv.style.display = "none";
});

// ========================================================================== //

/**
 * Program building grid buttons.
 */
export function InitGrid() {
    const gridDiv = document.body.querySelector("#game > .grid");
    const buttons = gridDiv.children as HTMLCollectionOf<HTMLButtonElement>;
    for (const button of buttons) button.onclick = () => ShowBuildPanel();
}

/**
 * Show toast when game days pass.
 */
export const ShowGameDay: (turn: number) => void = CACHE(
    (cache: GameUiCache, turn: number) => {
        const title = cache.newDayDiv.children[1];
        title.innerHTML = "Day " + turn.toString();
        cache.newDayDiv.animate(
            [
                { opacity: "0" },
                { opacity: "100" },
                { opacity: "100" },
                { opacity: "0" },
            ],
            {
                easing: "cubic-bezier(0, 0.2, 1, 1)",
                duration: 1800,
                iterations: 1,
            }
        );
    }
);

/**
 * Spawn enemy card in fight bar.
 */
export const AddEnemy: () => void = CACHE((cache: GameUiCache) => {
    cache.fightBarDiv.appendChild(cache.enemyTemplate.content.cloneNode(true));
    const addedEnemy = cache.fightBarDiv.lastElementChild as HTMLButtonElement;
    addedEnemy.onclick = () => ShowCombatPanel();
    addedEnemy.animate(
        [{ transform: "translateX(100vw)" }, { transform: "translateX(0)" }],
        {
            easing: "cubic-bezier(0, 1, 0.4, 1)",
            duration: 1000,
            iterations: 1,
        }
    );
});

/**
 * Increment player tools.
 */
export const AddTools: (added: number) => void = CACHE(
    (cache: GameUiCache, added: number) => {
        cache.toolSpan.innerHTML = "⚒️" + (cache.tools + added).toString();
    }
);
