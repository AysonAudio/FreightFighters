import type { BuildingSpawnEvent } from "./game-building";
import type { ResourceChangeEvent } from "./game-inventory";

import { GetBuildingCache } from "./game-building.js";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * All global UI variables.
 */
type CacheUI = {
    /**
     * Building Grid.
     * Each child button is a spot for a spawned building.
     */
    gridDiv: HTMLDivElement;
    /** Child buttons. */
    gridButtons: NodeListOf<HTMLButtonElement>;
    /** Child images of child buttons. */
    gridButtonImgs: NodeListOf<HTMLImageElement>;

    /**
     * Build Panel.
     * Unhides and shows details when a building is clicked on.
     * Hides all other panels.
     */
    buildPanelDiv: HTMLDivElement;
    /** Building title. */
    buildPanelHeading: HTMLHeadingElement;
    /** Building description. */
    buildPanelParagraph: HTMLParagraphElement;
    /** Building actions. */
    buildPanelButtons: NodeListOf<HTMLButtonElement>;
    /** Child images of building actions. */
    buildPanelImages: NodeListOf<HTMLImageElement>;

    /**
     * Combat Panel.
     * Unhides and shows details when an enemy is clicked on.
     * Hides all other panels.
     */
    combatPanelDiv: HTMLDivElement;

    /**
     * Fight Bar.
     * Each child button is a spawned enemy.
     */
    fightBarDiv: HTMLDivElement;
    /** Cloned to spawn a new enemy. */
    enemyTemplate: HTMLTemplateElement;

    /** Tool Display. A player resource counter. */
    toolSpan: HTMLSpanElement;

    /**
     * Day Toast.
     * Shows the current game day.
     */
    dayToastDiv: HTMLDivElement;
    /** Toast title. */
    dayToastHeading: HTMLHeadingElement;
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * A decorated function.
 * One global {@link CacheUI} object is initialized in the decorator.
 * Calling the resulting function returns the same object every time.
 */
export const GetCacheUI: () => CacheUI = (() => {
    const cache: CacheUI = {
        gridDiv: document.body.querySelector("#game > .grid"),
        gridButtons: document.body.querySelectorAll("#game > .grid > button"),
        gridButtonImgs: document.body.querySelectorAll(
            "#game > .grid > button > img"
        ),

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
        buildPanelImages: document.body.querySelectorAll(
            "#game > #build > button > img"
        ),

        combatPanelDiv: document.body.querySelector("#game > #combat"),

        fightBarDiv: document.body.querySelector("#game > #fight"),

        enemyTemplate: document.body.querySelector("#enemy"),

        toolSpan: document.body.querySelector("#game > .dashboard > #tools"),

        dayToastDiv: document.body.querySelector("#day"),
        dayToastHeading: document.body.querySelector("#day > h1"),
    };

    return () => cache;
})();

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Set onclicks for all UI buttons.
 * Each button dispatches a CustomEvent onclick. Event.detail = button index.
 * Other libraries can listen to this event to modularly add button functionality.
 */
function InitButtonClicks() {
    const cache: CacheUI = GetCacheUI();
    for (let i = 0; i < cache.gridButtons.length; i++) {
        cache.gridButtons[i].onclick = () =>
            window.dispatchEvent(new CustomEvent("clickGrid", { detail: i }));
    }
}

/**
 * Listen for Grid click event:
 * - Update Build Panel UI.
 */
function InitGridEventsForUI() {
    const cache: CacheUI = GetCacheUI();
    window.addEventListener("clickGrid", (e: CustomEvent<number>) => {
        const buildingCache = GetBuildingCache();
        const building = buildingCache.buildings[e.detail];
        // Show Build Panel. Hide other panels.
        cache.buildPanelDiv.style.display = "";
        cache.combatPanelDiv.style.display = "none";
        // Update text and images.
        if (building) {
            cache.buildPanelHeading.innerHTML = building.name;
            cache.buildPanelParagraph.innerHTML = building.desc;
        } else {
            cache.buildPanelHeading.innerHTML = "";
            cache.buildPanelParagraph.innerHTML = "";
        }
    });
}

/**
 * Listen for building spawn event:
 * - Update Building Grid UI.
 */
function InitBuildingEventsForUI() {
    const cache: CacheUI = GetCacheUI();
    window.addEventListener("spawnBuilding", (e: BuildingSpawnEvent) => {
        cache.gridButtonImgs[e.detail.index].src = e.detail.building.iconURI;
    });
}

/**
 * Listen for resource gain events:
 * - Update resource counter UI.
 */
function InitResourceEventsForUI() {
    const cache: CacheUI = GetCacheUI();
    window.addEventListener("gainTools", (e: ResourceChangeEvent) => {
        cache.toolSpan.innerHTML = "⚒️" + e.detail.newTotal.toString();
    });
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Init all UI systems.
 * Run this once at game start.
 */
export function Init() {
    InitButtonClicks();
    InitGridEventsForUI();
    InitBuildingEventsForUI();
    InitResourceEventsForUI();
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Show an animated toast notification that shows the current game day.
 */
export function ShowGameDay(day: number) {
    const cache = GetCacheUI();
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

/**
 * Spawn a new enemy card in fight bar.
 * Set onclick for new enemy card:
 * - Show Combat Panel and hide other panels.
 */
export function SpawnEnemy() {
    const cache: CacheUI = GetCacheUI();
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
}
