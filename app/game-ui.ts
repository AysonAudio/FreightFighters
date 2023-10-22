import type { Building, BuildingSpawnEvent } from "./game-building";
import type { NumChangeEvent } from "./game-player";

import { GetBuildingCache } from "./game-building.js";
import { GetPlayerCache } from "./game-player.js";

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
    /** Building name. */
    buildPanelHeading: HTMLHeadingElement;
    /** Building portrait. */
    buildPanelImage: HTMLImageElement;
    /** Building counters. */
    buildPanelSpans: NodeListOf<HTMLSpanElement>;
    /** Building description. */
    buildPanelParagraph: HTMLParagraphElement;
    /** Building actions. */
    buildPanelButtons: NodeListOf<HTMLButtonElement>;
    /** Building action icons. */
    buildPanelSubimages: NodeListOf<HTMLImageElement>;

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

    /**
     * Wood Display.
     * A player resource counter.
     */
    woodSpan: HTMLSpanElement;

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
        buildPanelImage: document.body.querySelector(
            "#game > #build > .portrait"
        ),
        buildPanelSpans: document.body.querySelectorAll(
            "#game > #build > .mini-bar"
        ),
        buildPanelParagraph: document.body.querySelector(
            "#game > #build > .desc"
        ),
        buildPanelButtons: document.body.querySelectorAll(
            "#game > #build > button"
        ),
        buildPanelSubimages: document.body.querySelectorAll(
            "#game > #build > button > img"
        ),

        combatPanelDiv: document.body.querySelector("#game > #combat"),

        fightBarDiv: document.body.querySelector("#game > #fight"),

        enemyTemplate: document.body.querySelector("#enemy"),

        woodSpan: document.body.querySelector("#game > .dashboard > #wood"),

        dayToastDiv: document.body.querySelector("#day"),
        dayToastHeading: document.body.querySelector("#day > h1"),
    };

    return () => cache;
})();

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
    const cache = GetCacheUI();
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

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function UpdateBuildPanelText(building: Building | undefined) {
    const cache = GetCacheUI();
    if (building) {
        cache.buildPanelHeading.style.display = "";
        cache.buildPanelParagraph.style.display = "";
        cache.buildPanelHeading.innerHTML = building.name;
        cache.buildPanelParagraph.innerHTML = building.desc;
    } else {
        cache.buildPanelHeading.style.display = "none";
        cache.buildPanelParagraph.style.display = "none";
        cache.buildPanelHeading.innerHTML = "";
        cache.buildPanelParagraph.innerHTML = "";
    }
}

// ------------------------ //

function UpdateBuildPanelPortrait(building: Building | undefined) {
    const cache = GetCacheUI();
    if (building) {
        cache.buildPanelImage.style.display = "";
        cache.buildPanelImage.src = building.portraitURI;
    } else {
        cache.buildPanelImage.style.display = "none";
        cache.buildPanelImage.src = "";
    }
}

// ------------------------ //

function UpdateBuildPanelButtons(building: Building | undefined) {
    const cache = GetCacheUI();
    const buttons = cache.buildPanelButtons;
    const imgs = cache.buildPanelSubimages;

    if (building) {
        const actions = building.actions;
        if (!actions) return;

        for (let i = 0; i < actions.length; i++) {
            buttons[i].style.display = "";
            imgs[i].src = actions[i].iconURI;
        }
        for (let i = actions.length; i < imgs.length; i++) {
            buttons[i].style.display = "none";
            imgs[i].src = "";
        }
    } else {
        for (let i = 0; i < imgs.length; i++) {
            buttons[i].style.display = "none";
            imgs[i].src = "";
        }
    }
}

// ------------------------ //

function UpdateBuildPanelCounters(building: Building | undefined) {
    const cacheUI = GetCacheUI();
    const cachePlayer = GetPlayerCache();
    const spans = cacheUI.buildPanelSpans;

    if (building) {
        const usedSpans = building.counterIDs ? building.counterIDs.length : 0;
        for (let i = 0; i < usedSpans; i++) {
            const counter = cachePlayer.counters[building.counterIDs[i]];
            const value = cachePlayer.current[counter.key];
            if (!counter) return;
            spans[i].style.display = "";
            spans[i].innerHTML = counter.emblem.repeat(value);
        }
        for (let i = usedSpans; i < spans.length; i++) {
            spans[i].style.display = "none";
            spans[i].innerHTML = "";
        }
    } else {
        for (let i = 0; i < spans.length; i++) {
            spans[i].style.display = "none";
            spans[i].innerHTML = "";
        }
    }
}

// ------------------------ //

function UpdateBuildPanel(building: Building | undefined) {
    UpdateBuildPanelText(building);
    UpdateBuildPanelPortrait(building);
    UpdateBuildPanelButtons(building);
    UpdateBuildPanelCounters(building);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Set onclicks for all UI buttons.
 * Each button dispatches a CustomEvent onclick. Event.detail = button index.
 * Other libraries can listen to this event to modularly add button functionality.
 */
function SetButtonEvents() {
    const cache = GetCacheUI();
    // Building Grid //
    for (let i = 0; i < cache.gridButtons.length; i++) {
        cache.gridButtons[i].onclick = () =>
            window.dispatchEvent(new CustomEvent("click_grid", { detail: i }));
    }
    // Building Panel //
    for (let i = 0; i < cache.buildPanelButtons.length; i++) {
        cache.buildPanelButtons[i].onclick = () =>
            window.dispatchEvent(new CustomEvent("click_build", { detail: i }));
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Listen for Grid click event:
 * - Update Build Panel text and images to match the selected building.
 * - Unhide Build Panel. Hide all other panels.
 */
function ListenButtonEvents() {
    const cache = GetCacheUI();
    window.addEventListener("click_grid", (e: CustomEvent<number>) => {
        const buildingCache = GetBuildingCache();
        const building = buildingCache.buildings[e.detail];
        UpdateBuildPanel(building);
        cache.buildPanelDiv.style.display = "";
        cache.combatPanelDiv.style.display = "none";
    });
}

/**
 * Listen for building spawn event:
 * - Update Building Grid UI.
 */
function ListenBuildingEvents() {
    const cache = GetCacheUI();
    window.addEventListener("spawn_building", (e: BuildingSpawnEvent) => {
        cache.gridButtonImgs[e.detail.index].src = e.detail.building.iconURI;
    });
}

/**
 * Listen for player variable change events:
 * - Update UI numbers.
 * - Show toast animation if game day changes.
 */
function ListenResourceEvents() {
    const cacheUI = GetCacheUI();
    const cacheBuild = GetBuildingCache();
    const cachePlayer = GetPlayerCache();

    window.addEventListener("adjust", (e: NumChangeEvent) => {
        if (e.detail.key == "days") ShowGameDay(e.detail.newTotal);
        else if (e.detail.key == "wood")
            cacheUI.woodSpan.innerHTML = "🌲" + e.detail.newTotal.toString();
        else if (e.detail.key == "hp") {
            const index = cacheBuild.selected;
            if (index == undefined) return;

            const building = cacheBuild.buildings[index];
            if (!building.counterIDs) return;

            for (let i = 0; i < building.counterIDs.length; i++)
                if (e.detail.key == building.counterIDs[i]) {
                    const counter = cachePlayer.counters[e.detail.key];
                    if (!counter) return;

                    const span = cacheUI.buildPanelSpans[i];
                    const value = cachePlayer.current[counter.key];
                    span.innerHTML = counter.emblem.repeat(value);
                }
        }
    });
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Init all UI systems.
 * Run this once at game start.
 */
export function Init() {
    SetButtonEvents();
    ListenButtonEvents();
    ListenBuildingEvents();
    ListenResourceEvents();
}
