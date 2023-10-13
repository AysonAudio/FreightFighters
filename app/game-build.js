/**
 * A decorator factory.
 * Manages one global {@link GameBuildingCache} object and passes it to functions.
 */
const CACHE = (() => {
    let cache = {
        buildingTypes: {},
        buildings: [],
        buttonElems: document.querySelectorAll("#game > .grid > button"),
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
    const button = cache.buttonElems.item(i);
    const img = button.firstElementChild;
    cache.buildings.push(building);
    img.src = building.iconURI;
});
// ========================================================================== //
/**
 * Load building types into memory.
 * Add starting buildings to grid.
 */
export const InitBuildings = CACHE((cache) => {
    LoadBuildings().then(() => {
        AddBuilding(cache.buildingTypes.campfire);
    });
});
