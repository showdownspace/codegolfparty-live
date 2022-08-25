import type { Game } from "./model";

/**
 * @description Change the code here to update the scoreboard
 * @param game
 */
export function gameData(game: Game) {
  game.newRound({
    fastBonus: 5,
  });

  game.play([
    {
      nickname: "chayapatr",
      userId: "a8e0c3725446bbd1bc8e84544ef6de5e4644834",
      score: "100%",
      duration: "00:13:11",
      language: "Ruby",
      criterion: "18",
    },
    {
      nickname: "dtinth",
      userId: "1bc6963922756fd0de3a5fe3afd940245099983",
      score: "80%",
      duration: "00:03:22",
      language: "Ruby",
      criterion: "19",
    },
    {
      nickname: "sankaew",
      userId: "21db555b08ab827e346e3cda347b06391725834",
      score: "100%",
      duration: "00:13:24",
      language: "Python 3",
      criterion: "27",
    },
    {
      nickname: "Sork",
      userId: "88642c8e58e69d6cb192e7143684638d8625834",
      score: "100%",
      duration: "00:05:18",
      language: "Bash",
      criterion: "28",
    },
    {
      nickname: "Intaniger",
      userId: "bb8b9e17ba243b51495a878d49999a318204244",
      score: "100%",
      duration: "00:10:44",
      language: "Python 3",
      criterion: "54",
    },
    {
      nickname: "wit03",
      userId: "737245f24698d6bdeab7ce4c589763699152833",
      score: "0%",
      duration: "00:15:00",
      language: "JavaScript",
      criterion: "65",
    },
    {
      nickname: "phoomparin",
      userId: "13ca41aa0f4a9d10bef1c30e82dc4e273633114",
      score: "0%",
      duration: "00:15:00",
      language: "Ruby",
      criterion: "181",
    },
  ]);

  game.showSetRanking();

  game.finishSet();

  game.newRound({
    langAutoBalance: "allRounds",
  });

  game.play([
    {
      nickname: "chayapatr",
      userId: "a8e0c3725446bbd1bc8e84544ef6de5e4644834",
      score: "100%",
      duration: "00:13:11",
      language: "Ruby",
      criterion: "18",
    },
    {
      nickname: "dtinth",
      userId: "1bc6963922756fd0de3a5fe3afd940245099983",
      score: "100%",
      duration: "00:03:22",
      language: "Ruby",
      criterion: "19",
    },
    {
      nickname: "sankaew",
      userId: "21db555b08ab827e346e3cda347b06391725834",
      score: "100%",
      duration: "00:13:24",
      language: "Python 3",
      criterion: "27",
    },
    {
      nickname: "Sork",
      userId: "88642c8e58e69d6cb192e7143684638d8625834",
      score: "100%",
      duration: "00:05:18",
      language: "Bash",
      criterion: "28",
    },
    {
      nickname: "Intaniger",
      userId: "bb8b9e17ba243b51495a878d49999a318204244",
      score: "100%",
      duration: "00:10:44",
      language: "Python 3",
      criterion: "54",
    },
    {
      nickname: "wit03",
      userId: "737245f24698d6bdeab7ce4c589763699152833",
      score: "0%",
      duration: "00:15:00",
      language: "JavaScript",
      criterion: "65",
    },
    {
      nickname: "phoomparin",
      userId: "13ca41aa0f4a9d10bef1c30e82dc4e273633114",
      score: "0%",
      duration: "00:15:00",
      language: "Ruby",
      criterion: "181",
    },
  ]);

  game.showSetRanking();
  game.finishSet();

  // game.goLive();
}
