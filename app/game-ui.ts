/** All global variables to cache when the game is loaded. */
type GameUiCache = {
    /** A grid with building spot buttons. */
    gridElem: HTMLDivElement;
    /** A panel with building details and options. */
    buildPanelElem: HTMLDivElement;
    /** A bar with enemy cards. */
    fightElem: HTMLDivElement;
    /** An enemy card template. */
    enemyTemplate: HTMLTemplateElement;
    /** A panel with combat details and options. */
    combatPanelElem: HTMLDivElement;
    /** A toast with current turn number. */
    newTurnElem: HTMLDivElement;
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
const ShowBuildPanel: () => void = CACHE((cache: GameUiCache) => {
    cache.buildPanelElem.style.display = "";
    cache.combatPanelElem.style.display = "none";
});

/**
 * Click fight card.
 * Show combat details and options.
 * Hide other panels.
 */
const ShowCombatPanel: () => void = CACHE((cache: GameUiCache) => {
    cache.combatPanelElem.style.display = "";
    cache.buildPanelElem.style.display = "none";
});

// ========================================================================== //

/**
 * Init grid buttons.
 */
export const InitGrid: () => void = CACHE((cache: GameUiCache) => {
    for (const buttonElem of cache.gridElem
        .children as HTMLCollectionOf<HTMLButtonElement>)
        buttonElem.onclick = () => ShowBuildPanel();
});

/**
 * Create enemy card in #fight.
 */
export const AddEnemy: () => void = CACHE((cache: GameUiCache) => {
    cache.fightElem.appendChild(cache.enemyTemplate.content.cloneNode(true));
    const addedEnemy = cache.fightElem.lastElementChild as HTMLButtonElement;
    addedEnemy.onclick = () => ShowCombatPanel();
    addedEnemy.animate(
        [{ transform: "translateX(100vw)" }, { transform: "translateX(0)" }],
        {
            easing: "cubic-bezier(0.42, 0, 0.58, 1)",
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
        const title = cache.newTurnElem.children[1];
        title.innerHTML = "Day " + turn.toString();
        cache.newTurnElem.animate(
            [
                { opacity: "0" },
                { opacity: "100" },
                { opacity: "100" },
                { opacity: "0" },
            ],
            {
                duration: 1500,
                iterations: 1,
            }
        );
    }
);
