import * as Menu from "./menu.js";
import * as GameUI from "./game-ui.js";

// ========================================================================== //

Menu.InitMenu();
GameUI.InitGrid();

document.body.addEventListener("play", (e) => {
    GameUI.AddEnemy();
    GameUI.AddEnemy();
    GameUI.AddEnemy();
});
