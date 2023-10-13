/** All global variables to cache when the game is loaded. */
type GameUiCache = {
    /** A grid with building spot buttons. */
    gridDiv: HTMLDivElement;
    /** A panel with building details and actions. */
    buildPanelDiv: HTMLDivElement;
    /** A panel with combat details and actions. */
    combatPanelDiv: HTMLDivElement;
    /** A bar with enemy cards. */
    fightDiv: HTMLDivElement;
    /** Current tool amount. */
    tools: number;
    /** A span showing current tool amount. */
    toolSpan: HTMLSpanElement;
    /** A toast with current game day. */
    gameDayDiv: HTMLDivElement;
    /** A template of an enemy card. */
    enemyTemplate: HTMLTemplateElement;
};

/** A function that needs access to a global variable. */
type GameUiFunc<Return> = (cache: GameUiCache, ...args) => Return;

/**
 * A decorator factory.
 * Manages one global {@link GameUiCache} object and passes it to functions.
 */
const CACHE: <Return>(func: GameUiFunc<Return>) => (...args) => Return =
    (() => {
        const cache: GameUiCache = {
            gridDiv: document.body.querySelector("#game > .grid"),
            buildPanelDiv: document.body.querySelector("#game > #build"),
            combatPanelDiv: document.body.querySelector("#game > #combat"),
            fightDiv: document.body.querySelector("#game > #fight"),
            tools: 0,
            toolSpan: document.body.querySelector(
                "#game > .dashboard > #tools"
            ),
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
const ShowBuildPanel: () => void = CACHE((cache: GameUiCache) => {
    cache.buildPanelDiv.style.display = "";
    cache.combatPanelDiv.style.display = "none";
});

/**
 * Click fight card.
 * Show combat details and actions.
 * Hide other panels.
 */
const ShowCombatPanel: () => void = CACHE((cache: GameUiCache) => {
    cache.combatPanelDiv.style.display = "";
    cache.buildPanelDiv.style.display = "none";
});

// ========================================================================== //

/**
 * Init grid buttons.
 */
export const InitGrid: () => void = CACHE((cache: GameUiCache) => {
    for (const buttonElem of cache.gridDiv
        .children as HTMLCollectionOf<HTMLButtonElement>)
        buttonElem.onclick = () => ShowBuildPanel();
});

/**
 * Create enemy card in #fight.
 */
export const AddEnemy: () => void = CACHE((cache: GameUiCache) => {
    cache.fightDiv.appendChild(cache.enemyTemplate.content.cloneNode(true));
    const addedEnemy = cache.fightDiv.lastElementChild as HTMLButtonElement;
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
 * Show toast when game days pass.
 */
export const ShowGameDay: (turn: number) => void = CACHE(
    (cache: GameUiCache, turn: number) => {
        const title = cache.gameDayDiv.children[1];
        title.innerHTML = "Day " + turn.toString();
        cache.gameDayDiv.animate(
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
 * Increment tools.
 */
export const AddTools: (added: number) => void = CACHE(
    (cache: GameUiCache, added: number) => {
        cache.toolSpan.innerHTML = "⚒️" + (cache.tools + added).toString();
    }
);
