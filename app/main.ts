import * as LibBuilding from "./game-building.js";
import * as LibPlayer from "./game-player.js";
import * as LibUI from "./game-ui.js";
import * as Menu from "./menu.js";

// ========================================================================== //

LibBuilding.Init();
LibPlayer.Init();
LibUI.Init();
Menu.Init();

window.addEventListener("play", (e) => {
    LibBuilding.SpawnStarterBuildings();
    LibUI.ShowGameDay(1);
    LibUI.SpawnEnemy();
    LibUI.SpawnEnemy();
    LibUI.SpawnEnemy();
});
