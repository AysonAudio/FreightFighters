/** A building type from /data/building.json. */
type GameBuildingType = {
    iconURI: string;
    name: string;
    desc: string;
    actions: {
        iconURI: string;
        addDays: number;
        addTools: number;
    }[];
};

/** A JSON object containing building types. */
interface GameBuildingJSON {
    [key: string]: GameBuildingType;
}

/** All building types in /data/building.json. */
interface GameBuildingData extends GameBuildingJSON {
    campfire?: GameBuildingType;
}

// ========================================================================== //

/** Variables cached in memory for quick access. */
type GameBuildingCache = {
    /** All building types in /data/building.json. */
    buildingTypes: GameBuildingData;
    /** Spawned buildings. */
    buildings: GameBuildingType[];
    /** Building grid buttons. */
    buttonElems: NodeListOf<HTMLButtonElement>;
};

/** A function that needs access to a global variable. */
type GameBuildingFunc<Return> = (cache: GameBuildingCache, ...args) => Return;

/**
 * A decorator factory.
 * Manages one global {@link GameBuildingCache} object and passes it to functions.
 */
const CACHE: <Return>(func: GameBuildingFunc<Return>) => (...args) => Return =
    (() => {
        let cache: GameBuildingCache = {
            buildingTypes: {},
            buildings: [],
            buttonElems: document.querySelectorAll<HTMLButtonElement>(
                "#game > .grid > button"
            ),
        };

        return (func) => {
            return (...args) => func(cache, ...args);
        };
    })();

/**
 * Load building types into memory.
 */
const LoadBuildings: () => Promise<void> = CACHE(
    async (cache: GameBuildingCache) => {
        return fetch("../data/building.json")
            .then((response) => response.json())
            .then((json: { buildings: GameBuildingData }) => {
                cache.buildingTypes = json.buildings;
            });
    }
);

// ========================================================================== //

/**
 * Add a building to grid.
 */
const AddBuilding: (building: GameBuildingType) => void = CACHE(
    (cache: GameBuildingCache, building: GameBuildingType) => {
        const i = cache.buildings.length;
        const button = cache.buttonElems.item(i);
        const img = button.firstElementChild as HTMLImageElement;
        cache.buildings.push(building);
        img.src = building.iconURI;
        // to do: add name and desc to ui.
        // to do: implement items.
    }
);

// ========================================================================== //

/**
 * Load building types into memory.
 * Add starting buildings to grid.
 */
export const InitBuildings: () => void = CACHE((cache: GameBuildingCache) => {
    LoadBuildings().then(() => {
        AddBuilding(cache.buildingTypes.campfire);
    });
});
