import { gameData } from "./data";
import { Game } from "./model";

const game = new Game();
gameData(game);

export const view = game.view;
