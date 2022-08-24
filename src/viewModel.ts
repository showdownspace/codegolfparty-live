import { gameData } from "./data";
import { Game } from "./model";

const game = new Game();
gameData(game);

export const view =
  +new URLSearchParams(window.location.search).get("live")! === 1
    ? game.liveView
    : game.view;

export const buffClass = "text-green-400";
export const nerfClass = "text-red-400";
export const bonusClass = "text-yellow-400";
export const mysteryClass = "text-violet-400";
