import type { Building, BuildingSpawnEvent } from "./game-building";
import type { Enemy, EnemySpawnEvent } from "./game-enemy";
import type { PlayerNums, NumChangeEvent } from "./game-player";

import { GetBuildingCache } from "./game-building.js";
import { GetEnemyCache } from "./game-enemy.js";
import { GetPlayerCache } from "./game-player.js";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export type Panel = {
    title: string;
    desc: string;
    portraitURI: string;
    counterIDs: string[];
    actions: {
        iconURI: string;
        adjust?: PlayerNums;
        min?: PlayerNums;
        max?: PlayerNums;
    }[];
};

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
     * Panel.
     * Unhides and shows details when a building or enemy is clicked on.
     */
    panelDiv: HTMLDivElement;
    /** Building name. */
    panelHeading: HTMLHeadingElement;
    /** Building portrait. */
    panelImage: HTMLImageElement;
    /** Building counters. */
    panelSpans: NodeListOf<HTMLSpanElement>;
    /** Building description. */
    panelParagraph: HTMLParagraphElement;
    /** Building actions. */
    panelButtons: NodeListOf<HTMLButtonElement>;
    /** Building action icons. */
    panelSubimages: NodeListOf<HTMLImageElement>;

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

        panelDiv: document.body.querySelector("#game > .panel"),
        panelHeading: document.body.querySelector("#game > .panel > .title"),
        panelImage: document.body.querySelector("#game > .panel > .portrait"),
        panelSpans: document.body.querySelectorAll(
            "#game > .panel > .mini-bar"
        ),
        panelParagraph: document.body.querySelector("#game > .panel > .desc"),
        panelButtons: document.body.querySelectorAll("#game > .panel > button"),
        panelSubimages: document.body.querySelectorAll(
            "#game > .panel > button > img"
        ),

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

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function UpdatePanelText(obj: Building | Enemy | undefined) {
    const cache = GetCacheUI();
    if (obj) {
        cache.panelHeading.style.display = "";
        cache.panelParagraph.style.display = "";
        cache.panelHeading.innerHTML = obj.title;
        cache.panelParagraph.innerHTML = obj.desc;
    } else {
        cache.panelHeading.style.display = "none";
        cache.panelParagraph.style.display = "none";
        cache.panelHeading.innerHTML = "";
        cache.panelParagraph.innerHTML = "";
    }
}

// ------------------------ //

function UpdatePanelPortrait(obj: Building | Enemy | undefined) {
    const cache = GetCacheUI();
    if (obj) {
        cache.panelImage.style.display = "";
        cache.panelImage.src = obj.portraitURI;
    } else {
        cache.panelImage.style.display = "none";
        cache.panelImage.src = "";
    }
}

// ------------------------ //

function UpdatePanelButtons(obj: Building | Enemy | undefined) {
    const cache = GetCacheUI();
    const buttons = cache.panelButtons;
    const imgs = cache.panelSubimages;

    if (obj) {
        const actions = obj.actions || [];
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

function UpdatePanelCounters(obj: Building | Enemy | undefined) {
    const cacheUI = GetCacheUI();
    const cachePlayer = GetPlayerCache();
    const spans = cacheUI.panelSpans;

    if (obj) {
        const usedSpans = obj.counterIDs ? obj.counterIDs.length : 0;
        for (let i = 0; i < usedSpans; i++) {
            const counter = cachePlayer.counters[obj.counterIDs[i]];
            if (!counter) continue;

            const value = cachePlayer.current[counter.key];
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

function UpdatePanel(obj: Building | Enemy | undefined) {
    UpdatePanelText(obj);
    UpdatePanelPortrait(obj);
    UpdatePanelButtons(obj);
    UpdatePanelCounters(obj);
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
    // Panel //
    for (let i = 0; i < cache.panelButtons.length; i++) {
        cache.panelButtons[i].onclick = () =>
            window.dispatchEvent(
                new CustomEvent("click_action", { detail: i })
            );
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Listen for Building and Enemy click events:
 * - Unhide and update Panel to show selected building's details.
 * - Set Panel id to apply build-related-css.
 */
function ListenButtonEvents() {
    const cache = GetCacheUI();
    window.addEventListener("click_grid", (e: CustomEvent<number>) => {
        const buildingCache = GetBuildingCache();
        const building = buildingCache.buildings[e.detail];
        UpdatePanel(building);
        cache.panelDiv.style.display = "";
        cache.panelDiv.id = "build";
    });
    window.addEventListener("click_enemy", (e: CustomEvent<number>) => {
        const enemyCache = GetEnemyCache();
        const enemy = enemyCache.enemies[e.detail];
        UpdatePanel(enemy);
        cache.panelDiv.style.display = "";
        cache.panelDiv.id = "combat";
    });
}

/**
 * Listen for building spawn event:
 * - Set Grid button icon.
 */
function ListenBuildingEvents() {
    const cache = GetCacheUI();
    window.addEventListener("spawn_building", (e: BuildingSpawnEvent) => {
        cache.gridButtonImgs[e.detail.index].src = e.detail.building.iconURI;
    });
}

/**
 * Listen for enemy spawn event:
 * - Clone a new enemy card into fight bar.
 * - Set card title, art, danger, and hp.
 * - Animate: Slide from right.
 * - Set onclick:
 *     - Dispatch a CustomEvent. Event.detail = button index.
 *     - Other libraries can listen to this event to modularly add button functionality.
 */
function ListenEnemyEvents() {
    const cache = GetCacheUI();
    window.addEventListener("spawn_enemy", (e: EnemySpawnEvent) => {
        let card: HTMLButtonElement;
        let cardTitle: HTMLHeadingElement;
        let cardArt: HTMLImageElement;
        let cardCounters: NodeListOf<HTMLSpanElement>;

        cache.fightBarDiv.append(cache.enemyTemplate.content.cloneNode(true));
        card = cache.fightBarDiv.lastElementChild as HTMLButtonElement;
        cardTitle = card.querySelector(".title");
        cardArt = card.querySelector(".bg-art > img");
        cardCounters = card.querySelectorAll(".counters > *");

        cardTitle.innerHTML = e.detail.enemy.name;
        cardArt.src = e.detail.enemy.artURI;
        cardCounters[0].innerHTML = "☠️" + e.detail.enemy.danger + "%";
        cardCounters[1].innerHTML = "" + e.detail.enemy.hp + "🤍";

        card.animate(
            [
                { transform: "translateX(100vw)" },
                { transform: "translateX(0)" },
            ],
            {
                easing: "cubic-bezier(0, 1, 0.4, 1)",
                duration: 1000,
                iterations: 1,
            }
        );

        card.onclick = () =>
            window.dispatchEvent(
                new CustomEvent("click_enemy", { detail: e.detail.index })
            );
    });
}

/**
 * Listen for player variable change events:
 * - Update dashboard.
 * - Update panel counters.
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
                    if (!counter) continue;

                    const span = cacheUI.panelSpans[i];
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
    ListenEnemyEvents();
    ListenResourceEvents();
}
