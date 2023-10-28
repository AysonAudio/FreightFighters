import type { Building, BuildingSpawnEvent } from "./game-building";
import type { Enemy, EnemyEvent } from "./game-enemy";
import type { PlayerNums, NumVars, NumChangeEvent } from "./game-player";

import { GetBuildingCache } from "./game-building.js";
import { GetEnemyCache } from "./game-enemy.js";
import { GetPlayerCache } from "./game-player.js";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export type Action = {
    iconURI: string;
    build?: string[];
    kill?: boolean;
    adjustCurr?: NumVars;
    adjustRenew?: PlayerNums;
    min?: NumVars;
    max?: NumVars;
};

export type Panel = {
    title: string;
    desc: string;
    portraitURI: string;
    counterIDs: string[];
    actions: Action[];
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export type GridClick = {
    buttonIndex: number;
    building: Building;
};
export type GridClickEvent = CustomEvent<GridClick>;

export type ActionClick = {
    buttonIndex: number;
    building?: Building;
    enemy?: Enemy;
    action?: Action;
};
export type ActionClickEvent = CustomEvent<ActionClick>;

export type EnemyClick = {
    buttonIndex: number;
    enemy: Enemy;
};
export type EnemyClickEvent = CustomEvent<EnemyClick>;

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

    /** Wood Display. A player resource counter. */
    woodSpan: HTMLSpanElement;
    /** Troops Display. A player resource counter. */
    troopsSpan: HTMLSpanElement;

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
        troopsSpan: document.body.querySelector("#game > .dashboard > #troops"),

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
    cache.dayToastHeading.innerHTML = "Day " + (day + 1).toString();
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

            const value = counter.number || cachePlayer.current[counter.key];
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
 * Set onclicks for all static UI buttons.
 * Each button dispatches a CustomEvent onclick.
 * Other libraries can listen to this event to modularly add button functionality.
 */
function SetButtonEvents() {
    const cacheUI = GetCacheUI();
    const cacheBuilding = GetBuildingCache();
    const cacheEnemy = GetEnemyCache();
    const cachePlayer = GetPlayerCache();

    // Building Grid //
    for (let i = 0; i < cacheUI.gridButtons.length; i++) {
        cacheUI.gridButtons[i].onclick = () => {
            window.dispatchEvent(
                new CustomEvent<GridClick>("click_grid", {
                    detail: {
                        buttonIndex: i,
                        building: cacheBuilding.buildings[i],
                    },
                })
            );
        };
    }

    // Panel Actions //
    for (let i = 0; i < cacheUI.panelButtons.length; i++) {
        cacheUI.panelButtons[i].onclick = () => {
            const building = cacheBuilding.buildings[cacheBuilding.selected];
            const enemy = cacheEnemy.enemies[cacheEnemy.selected];
            const action = building?.actions[i] || enemy?.actions[i];
            if (!action) return;

            // Dont send event if action requirements not met
            for (const key in action.min)
                if (cachePlayer.current[key] < action.min[key]) return;
            for (const key in action.max)
                if (cachePlayer.current[key] >= action.max[key]) return;

            window.dispatchEvent(
                new CustomEvent<ActionClick>("click_action", {
                    detail: {
                        buttonIndex: i,
                        building: building,
                        enemy: enemy,
                        action: action,
                    },
                })
            );
        };
    }
}

/**
 * Reset onclicks for all existing enemy card buttons.
 * Dispatches a CustomEvent onclick.
 * Other libraries can listen to this event to modularly add button functionality.
 *
 * Run this after splicing an enemy and enemy card to reset button indices.
 */
function ResetEnemyEvents() {
    const cacheUI = GetCacheUI();
    const cacheEnemy = GetEnemyCache();
    const cards = cacheUI.fightBarDiv.children;

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLButtonElement;
        card.onclick = () =>
            window.dispatchEvent(
                new CustomEvent<EnemyClick>("click_enemy", {
                    detail: {
                        buttonIndex: i,
                        enemy: cacheEnemy.enemies[i],
                    },
                })
            );
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Listen for Building and Enemy click events:
 * - Unhide and update Panel to show selection's details.
 * - Set Panel id to apply build-related-css.
 */
function ListenButtonEvents() {
    const cache = GetCacheUI();
    window.addEventListener("click_grid", (e: GridClickEvent) => {
        UpdatePanel(e.detail.building);
        cache.panelDiv.style.display = "";
        cache.panelDiv.id = "build";
    });
    window.addEventListener("click_enemy", (e: EnemyClickEvent) => {
        UpdatePanel(e.detail.enemy);
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
 * - Clone a new enemy card elem into fight bar.
 * - Set card title, art, and numbers.
 * - Animate: Slide from right.
 * - Set onclick:
 *     - Dispatch a CustomEvent.
 *     - Other libraries can listen to this event to modularly add button functionality.
 */
function ListenEnemySpawnEvents() {
    const cache = GetCacheUI();

    window.addEventListener("spawn_enemy", (e: EnemyEvent) => {
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
        cardCounters[0].innerHTML = "🎲" + e.detail.enemy.hitChance + "%";
        cardCounters[1].innerHTML = "" + e.detail.enemy.hitDamage + "☠️";

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
                new CustomEvent<EnemyClick>("click_enemy", {
                    detail: {
                        buttonIndex: e.detail.index,
                        enemy: e.detail.enemy,
                    },
                })
            );
    });
}

/**
 * Listen for enemy kill event:
 * - Delete enemy card elem.
 * - Update button indices in enemy card onclicks.
 * - Clear and hide Panel.
 */
function ListenEnemyKillEvents() {
    const cache = GetCacheUI();
    window.addEventListener("kill_enemy", (e: EnemyEvent) => {
        let card = cache.fightBarDiv.children[e.detail.index];
        cache.fightBarDiv.removeChild(card);
        card.remove();
        ResetEnemyEvents();
        UpdatePanel(undefined);
        cache.panelDiv.style.display = "";
        cache.panelDiv.id = "";
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

    window.addEventListener("adjustCurr", (e: NumChangeEvent) => {
        if (e.detail.key == "days") ShowGameDay(e.detail.newTotal);
        else if (e.detail.key == "wood")
            cacheUI.woodSpan.innerHTML = "🌲" + e.detail.newTotal.toString();
        else if (e.detail.key == "troops")
            cacheUI.troopsSpan.innerHTML = "🤺" + e.detail.newTotal.toString();
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
                    const value =
                        counter.number || cachePlayer.current[counter.key];
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
    ListenEnemySpawnEvents();
    ListenEnemyKillEvents();
    ListenResourceEvents();
}
