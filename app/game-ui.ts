import type { GameBuildingEvent } from "./game-building";

// ========================================================================== //

/** Global UI variables. */
type GameUiCache = {
    /**
     * An element containing buttons.
     * Each button is a spot for a spawned building.
     */
    gridDiv: HTMLDivElement;
    /** Building Grid buttons. */
    gridButtons: NodeListOf<HTMLButtonElement>;
    /** Building Grid button images. */
    gridButtonImgs: NodeListOf<HTMLImageElement>;
    /** Index of last clicked button on Building Grid. */
    gridClicked: number | undefined;

    /**
     * An element with building details and actions.
     * Unhidden when a building is clicked on.
     */
    buildPanelDiv: HTMLDivElement;
    /** Build Panel title. */
    buildPanelHeading: HTMLHeadingElement;
    /** Build Panel description. */
    buildPanelParagraph: HTMLParagraphElement;
    /** Build Panel action buttons. */
    buildPanelButtons: NodeListOf<HTMLButtonElement>;

    /**
     * An element with combat details and actions.
     * Unhidden when an enemy is clicked on.
     */
    combatPanelDiv: HTMLDivElement;

    /**
     * An element containing buttons.
     * Each button is a spawned enemy card.
     */
    fightBarDiv: HTMLDivElement;

    /**
     * A template element.
     * Cloned when an enemy card is spawned.
     */
    enemyTemplate: HTMLTemplateElement;

    /**
     * A resource display.
     * Shows current tools.
     */
    toolSpan: HTMLSpanElement;
    /** Current tools. */
    tools: number;

    /**
     * A banner that fades in and out.
     * Shows the current game day.
     */
    dayToastDiv: HTMLDivElement;
    /** Day Toast title. */
    dayToastHeading: HTMLHeadingElement;
};

/** A function that needs access to a cached variable. */
type GameUiFunc<Return> = (cache: GameUiCache, ...args) => Return;

/** A custom event that passes the cache. */
export type GameUiEvent = CustomEvent<GameUiCache>;

/**
 * A decorator factory.
 * Manages one global {@link GameUiCache} object and passes it to functions.
 */
const CACHE: <Return>(func: GameUiFunc<Return>) => (...args) => Return =
    (() => {
        const cache: GameUiCache = {
            gridDiv: document.body.querySelector("#game > .grid"),
            gridButtons: document.body.querySelectorAll(
                "#game > .grid > button"
            ),
            gridButtonImgs: document.body.querySelectorAll(
                "#game > .grid > button > img"
            ),
            gridClicked: undefined,

            buildPanelDiv: document.body.querySelector("#game > #build"),
            buildPanelHeading: document.body.querySelector(
                "#game > #build > .title"
            ),
            buildPanelParagraph: document.body.querySelector(
                "#game > #build > .desc"
            ),
            buildPanelButtons: document.body.querySelectorAll(
                "#game > #build > button"
            ),

            combatPanelDiv: document.body.querySelector("#game > #combat"),

            fightBarDiv: document.body.querySelector("#game > #fight"),

            enemyTemplate: document.body.querySelector("#enemy"),

            toolSpan: document.body.querySelector(
                "#game > .dashboard > #tools"
            ),
            tools: 0,

            dayToastDiv: document.body.querySelector("#day"),
            dayToastHeading: document.body.querySelector("#day > h1"),
        };

        return (func) => {
            return (...args) => func(cache, ...args);
        };
    })();

// ========================================================================== //

/**
 * Set onclick for Building Grid buttons.
 * - Show Build Panel and hide other panels.
 * - Dispatch a {@link GameUiEvent} named "onClickGrid".
 *
 * Listen for building spawn event.
 * - Update Building Grid button art.
 */
export const Init: () => void = CACHE((cache: GameUiCache) => {
    let i = 0;

    for (const button of cache.gridButtons) {
        const j = i;

        button.onclick = () => {
            cache.buildPanelDiv.style.display = "";
            cache.combatPanelDiv.style.display = "none";

            cache.gridClicked = j;
            document.body.dispatchEvent(
                new CustomEvent("onClickGrid", { detail: cache })
            );
        };

        i++;
    }

    document.body.addEventListener(
        "onSpawnBuilding",
        (e: GameBuildingEvent) => {
            const i = e.detail.buildings.length - 1;
            const building = e.detail.buildings[i];
            const gridButtonImg = cache.gridButtonImgs[i];
            gridButtonImg.src = building.iconURI;
        }
    );
});

// ========================================================================== //

/**
 * Show toast when game days pass.
 */
export const ShowGameDay: (day: number) => void = CACHE(
    (cache: GameUiCache, day: number) => {
        cache.dayToastHeading.innerHTML = "Day " + day.toString();
        cache.dayToastDiv.animate(
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
 * Spawn a new enemy card in fight bar.
 *
 * Set onclick for new enemy card.
 * - Show Combat Panel and hide other panels.
 */
export const SpawnEnemy: () => void = CACHE((cache: GameUiCache) => {
    let addedEnemy: HTMLButtonElement;

    cache.fightBarDiv.appendChild(cache.enemyTemplate.content.cloneNode(true));
    addedEnemy = cache.fightBarDiv.lastElementChild as HTMLButtonElement;
    addedEnemy.animate(
        [{ transform: "translateX(100vw)" }, { transform: "translateX(0)" }],
        {
            easing: "cubic-bezier(0, 1, 0.4, 1)",
            duration: 1000,
            iterations: 1,
        }
    );

    addedEnemy.onclick = () => {
        cache.combatPanelDiv.style.display = "";
        cache.buildPanelDiv.style.display = "none";
    };
});

/**
 * Increment player tools.
 */
export const AddTools: (added: number) => void = CACHE(
    (cache: GameUiCache, added: number) => {
        cache.toolSpan.innerHTML = "⚒️" + (cache.tools + added).toString();
    }
);
