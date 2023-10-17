export type Building = {
    iconURI: string;
    name: string;
    desc: string;
    actions: {
        iconURI: string;
        addDays?: number;
        addTools?: number;
    }[];
};

export type BuildingSpawn = {
    building: Building;
    index: number;
};

export type BuildingSpawnEvent = CustomEvent<BuildingSpawn>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** A JSON object containing building types. */
interface GameBuildingJSON {
    [key: string]: Building;
}

/** All building types in /data/building.json. */
interface GameBuildingData extends GameBuildingJSON {
    campfire?: Building;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** Global building variables. */
type BuildingCache = {
    /** Spawned buildings. */
    buildings: Building[];
    /** All building types in /data/building.json. */
    buildingTypes: GameBuildingData;
    /** True if buildingTypes are loaded. */
    areTypesLoaded: boolean;
};

/**
 * A decorated function.
 * One global {@link BuildingCache} object is initialized in the decorator.
 * Calling the resulting function returns the same object every time.
 */
export const GetBuildingCache: () => BuildingCache = (() => {
    let cache: BuildingCache = {
        buildingTypes: {},
        buildings: [],
        areTypesLoaded: false,
    };
    return () => cache;
})();

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Load building types from /data/building.json into cache.
 */
async function LoadTypes(): Promise<boolean> {
    const cache = GetBuildingCache();
    if (cache.areTypesLoaded) return false;
    return fetch("../data/building.json")
        .then((response) => response.json())
        .then((json: { buildings: GameBuildingData }) => {
            cache.buildingTypes = json.buildings;
            cache.areTypesLoaded = true;
            return true;
        });
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Spawn a new building.
 * Dispatch a {@link BuildingSpawnEvent}.
 */
function SpawnBuilding(building: Building) {
    const cache = GetBuildingCache();
    cache.buildings.push(building);
    window.dispatchEvent(
        new CustomEvent<BuildingSpawn>("spawnBuilding", {
            detail: {
                building: building,
                index: cache.buildings.length - 1,
            },
        })
    );
}

/**
 * Spawn buildings that the player starts the game with.
 */
export function SpawnStarterBuildings() {
    const cache = GetBuildingCache();
    LoadTypes().then(() => {
        SpawnBuilding(cache.buildingTypes.campfire);
    });
}
