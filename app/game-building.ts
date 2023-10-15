import type { GameUiEvent } from "./game-ui";

// ========================================================================== //

/** A building type from /data/building.json. */
type GameBuildingType = {
    iconURI: string;
    name: string;
    desc: string;
    actions: {
        iconURI: string;
        addDays?: number;
        addTools?: number;
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

/** Global building variables. */
type GameBuildingCache = {
    /** Spawned buildings. */
    buildings: GameBuildingType[];
    /** All building types in /data/building.json. */
    buildingTypes: GameBuildingData;
    /** True if buildingTypes are loaded. */
    areTypesLoaded: boolean;
};

/** A function that needs access to a global variable. */
type GameBuildingFunc<Return> = (cache: GameBuildingCache, ...args) => Return;

/** A custom event that passes the cache. */
export type GameBuildingEvent = CustomEvent<GameBuildingCache>;

/**
 * A decorator factory.
 * Manages one global {@link GameBuildingCache} object and passes it to functions.
 */
const CACHE: <Return>(func: GameBuildingFunc<Return>) => (...args) => Return =
    (() => {
        let cache: GameBuildingCache = {
            buildingTypes: {},
            buildings: [],
            areTypesLoaded: false,
        };

        return (func) => {
            return (...args) => func(cache, ...args);
        };
    })();

// ========================================================================== //

/**
 * Load building types from /data/building.json into cache.
 */
const LoadTypes: () => Promise<boolean> = CACHE(
    async (cache: GameBuildingCache) => {
        if (cache.areTypesLoaded) return false;
        return fetch("../data/building.json")
            .then((response) => response.json())
            .then((json: { buildings: GameBuildingData }) => {
                cache.buildingTypes = json.buildings;
                cache.areTypesLoaded = true;
                return true;
            });
    }
);

/**
 * Listen for Building Grid button click event.
 * - Fetch the button's corresponding building.
 * - Update Build Panel with building data.
 */
export const Init: () => void = CACHE((cache: GameBuildingCache) => {
    document.body.addEventListener("onClickGrid", (e: GameUiEvent) => {
        const building = cache.buildings[e.detail.gridClicked];
        if (building) {
            e.detail.buildPanelHeading.innerHTML = building.name;
            e.detail.buildPanelParagraph.innerHTML = building.desc;
        } else {
            e.detail.buildPanelHeading.innerHTML = "";
            e.detail.buildPanelParagraph.innerHTML = "";
        }
    });
});

// ========================================================================== //

/**
 * Spawn a new building.
 * Dispatch a {@link GameBuildingEvent} named "onSpawnBuilding".
 */
const SpawnBuilding: (building: GameBuildingType) => void = CACHE(
    (cache: GameBuildingCache, building: GameBuildingType) => {
        cache.buildings.push(building);
        document.body.dispatchEvent(
            new CustomEvent("onSpawnBuilding", { detail: cache })
        );
    }
);

/**
 * Spawn buildings that the player starts the game with.
 */
export const SpawnStarterBuildings: () => void = CACHE(
    (cache: GameBuildingCache) => {
        LoadTypes().then(() => {
            SpawnBuilding(cache.buildingTypes.campfire);
        });
    }
);
