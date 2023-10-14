/**
 * A decorator factory.
 * Manages one global {@link GameBuildingCache} object and passes it to functions.
 */
const CACHE = (() => {
    let cache = {
        buildingTypes: {},
        buildings: [],
        gridButtonElems: document.body.querySelectorAll("#game > .grid > button"),
        buildPanelTitleElem: document.body.querySelector("#game > #build > .title"),
        buildPanelDescElem: document.body.querySelector("#game > #build > .desc"),
        buildPanelButtonElems: document.body.querySelectorAll("#game > #build > button"),
    };
    return (func) => {
        return (...args) => func(cache, ...args);
    };
})();
/**
 * Load building types into memory.
 */
const LoadBuildings = CACHE(async (cache) => {
    return fetch("../data/building.json")
        .then((response) => response.json())
        .then((json) => {
        cache.buildingTypes = json.buildings;
    });
});
// ========================================================================== //
/**
 * Add a building to grid.
 */
const AddBuilding = CACHE((cache, building) => {
    const i = cache.buildings.length;
    const button = cache.gridButtonElems.item(i);
    const img = button.firstElementChild;
    img.src = building.iconURI;
    cache.buildings.push(building);
});
// ========================================================================== //
/**
 * Register event.
 * Update build panel when a building is clicked.
 */
export const InitBuildPanel = CACHE((cache) => {
    document.body.addEventListener("updateBuildPanel", (e) => {
        const building = cache.buildings[e.detail.clickedButtonIndex];
        if (!building)
            return;
        cache.buildPanelTitleElem.innerHTML = building.name;
        cache.buildPanelDescElem.innerHTML = building.desc;
        // cache.buildPanelButtonElems
    });
});
/**
 * Load building types into memory.
 * Add starting buildings to grid.
 */
export const InitBuildings = CACHE((cache) => {
    LoadBuildings().then(() => {
        AddBuilding(cache.buildingTypes.campfire);
    });
});
