/** All global variables to cache when the game is loaded. */
type GameUiCache = {
    /** A grid with building spot buttons. */
    gridDiv: HTMLDivElement;
    /** A panel with building details and options. */
    buildPanelDiv: HTMLDivElement;
    /** A bar with enemy cards. */
    fightDiv: HTMLDivElement;
    /** An enemy card template. */
    enemyTemplate: HTMLTemplateElement;
    /** A panel with combat details and options. */
    combatPanelDiv: HTMLDivElement;
    /** A toast with current turn number. */
    newTurnDiv: HTMLDivElement;
};

/** A function that needs access to a global variable. */
type GameBuildingsFunc<Return> = (cache: GameUiCache, ...args) => Return;

/**
 * A decorator factory.
 * Manages one global {@link GameBuildingsCache} object and passes it to functions.
 */
const CACHE: <Return>(func: GameBuildingsFunc<Return>) => (...args) => Return =
    (() => {
        const cache: GameUiCache = {
            gridDiv: document.body.querySelector("#game > .grid"),
            buildPanelDiv: document.body.querySelector("#game > #build"),
            fightDiv: document.body.querySelector("#game > #fight"),
            enemyTemplate: document.body.querySelector("#enemy"),
            combatPanelDiv: document.body.querySelector("#combat"),
            newTurnDiv: document.body.querySelector("#new-turn"),
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
const ShowBuildPanel: () => void = CACHE((cache: GameUiCache) => {
    cache.buildPanelDiv.style.display = "";
    cache.combatPanelDiv.style.display = "none";
});

/**
 * Click fight card.
 * Show combat details and options.
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
 * Show toast when new turn starts.
 */
export const ShowNewTurn: (turn: number) => void = CACHE(
    (cache: GameUiCache, turn: number) => {
        const title = cache.newTurnDiv.children[1];
        title.innerHTML = "Day " + turn.toString();
        cache.newTurnDiv.animate(
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
