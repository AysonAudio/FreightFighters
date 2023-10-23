import * as LibBuilding from "./game-building.js";
import * as LibEnemy from "./game-enemy.js";
import * as LibPlayer from "./game-player.js";
import * as LibUI from "./game-ui.js";
import * as Menu from "./menu.js";

// ========================================================================== //

Menu.Init();
LibUI.Init();
LibPlayer.Init();

window.addEventListener("play", (e) => {
    LibUI.ShowGameDay(1);

    LibBuilding.Init().then(() => {
        const buildingCache = LibBuilding.GetBuildingCache();
        LibBuilding.SpawnBuilding(buildingCache.buildingTypes.campfire);
        LibBuilding.SpawnBuilding(buildingCache.buildingTypes.tree);
    });

    LibEnemy.Init().then(() => {
        const enemyCache = LibEnemy.GetEnemyCache();
        LibEnemy.SpawnEnemy(enemyCache.enemyTypes.zombie);
        LibEnemy.SpawnEnemy(enemyCache.enemyTypes.zombie);
        LibEnemy.SpawnEnemy(enemyCache.enemyTypes.zombie);
    });
});
