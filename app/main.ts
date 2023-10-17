import * as GameBuilding from "./game-building.js";
import * as GameInventory from "./game-inventory.js";
import * as GameUI from "./game-ui.js";
import * as Menu from "./menu.js";

// ========================================================================== //

GameUI.Init();
Menu.Init();

document.body.addEventListener("play", (e) => {
    GameBuilding.SpawnStarterBuildings();
    GameInventory.GainTools(888);
    GameUI.ShowGameDay(1);
    GameUI.SpawnEnemy();
    GameUI.SpawnEnemy();
    GameUI.SpawnEnemy();
});
