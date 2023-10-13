import * as GameBuild from "./game-build.js";
import * as GameUI from "./game-ui.js";
import * as Menu from "./menu.js";
// ========================================================================== //
GameBuild.InitBuildings();
GameUI.InitGrid();
Menu.InitMenu();
document.body.addEventListener("play", (e) => {
    GameUI.ShowGameDay(1);
    GameUI.AddEnemy();
    GameUI.AddEnemy();
    GameUI.AddEnemy();
    GameUI.AddTools(888);
});
