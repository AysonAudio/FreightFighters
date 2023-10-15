import * as GameBuilding from "./game-building.js";
import * as GameUI from "./game-ui.js";
import * as Menu from "./menu.js";

// ========================================================================== //

GameBuilding.Init();
GameUI.Init();
Menu.Init();

document.body.addEventListener("play", (e) => {
    GameUI.ShowGameDay(1);
    GameUI.AddTools(888);
    GameUI.SpawnEnemy();
    GameUI.SpawnEnemy();
    GameUI.SpawnEnemy();
    GameBuilding.SpawnStarterBuildings();
});
