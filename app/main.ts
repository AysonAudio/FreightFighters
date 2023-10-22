import * as LibBuilding from "./game-building.js";
import * as LibPlayer from "./game-player.js";
import * as LibUI from "./game-ui.js";
import * as Menu from "./menu.js";

// ========================================================================== //

Menu.Init();
LibUI.Init();
LibPlayer.Init();

window.addEventListener("play", (e) => {
    LibBuilding.Init().then(() => {
        const buildingCache = LibBuilding.GetBuildingCache();
        LibBuilding.SpawnBuilding(buildingCache.buildingTypes.campfire);
        LibBuilding.SpawnBuilding(buildingCache.buildingTypes.tree);
    });

    LibUI.ShowGameDay(1);
    LibUI.SpawnEnemy();
    LibUI.SpawnEnemy();
    LibUI.SpawnEnemy();
});
