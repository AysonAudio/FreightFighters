import * as GameBuilding from "./game-building.js";
import * as GameInventory from "./game-inventory.js";
import * as GameUI from "./game-ui.js";
import * as Menu from "./menu.js";

// ========================================================================== //

GameBuilding.Init();
GameInventory.Init();
GameUI.Init();
Menu.Init();

window.addEventListener("play", (e) => {
    GameBuilding.SpawnStarterBuildings();
    GameUI.ShowGameDay(1);
    GameUI.SpawnEnemy();
    GameUI.SpawnEnemy();
    GameUI.SpawnEnemy();
});
