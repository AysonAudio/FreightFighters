import * as LibBuilding from "./game-building.js";
import * as LibEnemy from "./game-enemy.js";
import * as LibLevel from "./game-level.js";
import * as LibPlayer from "./game-player.js";
import * as LibUI from "./game-ui.js";
import * as Menu from "./menu.js";

// ========================================================================== //

LibLevel.Init();
LibPlayer.Init();
LibUI.Init();
Menu.Init();

window.addEventListener("play", (e) => {
    LibBuilding.Init().then(() => {
        const buildingCache = LibBuilding.GetBuildingCache();
        LibBuilding.SpawnBuilding(buildingCache.buildingTypes.campfire);
        LibBuilding.SpawnBuilding(buildingCache.buildingTypes.tree);
    });

    LibEnemy.Init().then(() => {
        LibLevel.SpawnLevel(0);
    });

    LibUI.ShowGameDay(0);
});
