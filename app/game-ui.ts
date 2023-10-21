import type { Building, BuildingSpawnEvent } from "./game-building";
import type { NumChangeEvent } from "./game-player";

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
 * Set onclicks for all UI buttons.
 * Each button dispatches a CustomEvent onclick. Event.detail = button index.
 * Other libraries can listen to this event to modularly add button functionality.
 */
function InitButtonClicks() {
    const cache: CacheUI = GetCacheUI();

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

/**
 * Listen for Grid click event:
 * - Update Build Panel UI.
 */
function InitClickEvents() {
    const cache: CacheUI = GetCacheUI();
    const buttons = cache.buildPanelButtons;
    const imgs = cache.buildPanelSubimages;
    const spans = cache.buildPanelSpans;

    window.addEventListener("click_grid", (e: CustomEvent<number>) => {
        const buildingCache = GetBuildingCache();
        const building = buildingCache.buildings[e.detail];

        // Show Build Panel. Hide other panels.
        cache.buildPanelDiv.style.display = "";
        cache.combatPanelDiv.style.display = "none";

        // ---- CLICKED GRID BUTTON HAS A BUILDING ---- //
        if (building) {
            const actions = building.actions || [];
            const counters = building.counters || [];

            // Unhide title and description. Update text.
            cache.buildPanelHeading.style.display = "";
            cache.buildPanelParagraph.style.display = "";
            cache.buildPanelHeading.innerHTML = building.name;
            cache.buildPanelParagraph.innerHTML = building.desc;
            // Unhide portrait. Update image.
            cache.buildPanelImage.style.display = "";
            cache.buildPanelImage.src = building.portraitURI;
            // Unhide actions. Update icons.
            for (let i = 0; i < actions.length; i++) {
                buttons[i].style.display = "";
                imgs[i].src = actions[i].iconURI;
            }
            // Hide unused actions. Clear icons.
            for (let i = actions.length; i < imgs.length; i++) {
                buttons[i].style.display = "none";
                imgs[i].src = "";
            }
            // Unhide counters. Update tally marks.
            for (let i = 0; i < counters.length; i++) {
                const emblem = counters[i].emblem;
                const amount = building.counters[i].value;
                spans[i].style.display = "";
                spans[i].innerHTML = emblem.repeat(amount);
            }
            // Hide unused counters. Clear tally marks.
            for (let i = counters.length; i < spans.length; i++) {
                spans[i].style.display = "none";
                spans[i].innerHTML = "";
            }
        }

        // ---- CLICKED GRID BUTTON HAS NO BUILDING ---- //
        else {
            // Hide title and description. Clear text.
            cache.buildPanelHeading.style.display = "none";
            cache.buildPanelParagraph.style.display = "none";
            cache.buildPanelHeading.innerHTML = "";
            cache.buildPanelParagraph.innerHTML = "";
            // Hide portrait. Clear image.
            cache.buildPanelImage.style.display = "none";
            cache.buildPanelImage.src = "";
            // Hide actions. Clear icons.
            for (let i = 0; i < imgs.length; i++) {
                buttons[i].style.display = "none";
                imgs[i].src = "";
            }
            // Hide counters. Clear tally marks.
            for (let i = 0; i < spans.length; i++) {
                spans[i].style.display = "none";
                spans[i].innerHTML = "";
            }
        }
    });
}

/**
 * Listen for building spawn event:
 * - Update Building Grid UI.
 */
function InitBuildingEvents() {
    const cache: CacheUI = GetCacheUI();
    window.addEventListener("spawn_building", (e: BuildingSpawnEvent) => {
        cache.gridButtonImgs[e.detail.index].src = e.detail.building.iconURI;
    });
}

/**
 * Listen for player variable change events:
 * - Update UI numbers.
 */
function InitResourceEvents() {
    const cacheUI: CacheUI = GetCacheUI();
    const cacheBuild = GetBuildingCache();

    window.addEventListener("adjust", (e: NumChangeEvent) => {
        switch (e.detail.key) {
            case "wood":
                cacheUI.woodSpan.innerHTML =
                    "🌲" + e.detail.newTotal.toString();
                break;
            default:
                if (cacheBuild.selected === undefined) break;
                if (!cacheBuild.buildings[cacheBuild.selected].counters) break;
                const selected = cacheBuild.buildings[cacheBuild.selected];
                for (let i = 0; i < selected.counters.length; i++)
                    if (e.detail.key == selected.counters[i].key) {
                        const span = cacheUI.buildPanelSpans[i];
                        const emblem = selected.counters[i].emblem;
                        const amount = selected.counters[i].value;
                        span.innerHTML = emblem.repeat(amount);
                    }
                break;
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
    InitButtonClicks();
    InitClickEvents();
    InitBuildingEvents();
    InitResourceEvents();
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
