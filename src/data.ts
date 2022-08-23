import type { Game } from "./model";

export function gameData(game: Game) {
  game.newRound();
  game.setMultiplier("Ruby", 2);
  game.setMultiplier("JavaScript", 0.25);

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

  // Uncomment to show set ranking
  game.showSetRanking();

  game.newRound();
  game.play([
    {
      nickname: "dtinth",
      userId: "1bc6963922756fd0de3a5fe3afd940245099983",
      score: "100%",
      duration: "00:12:46",
      language: "Ruby",
      criterion: "155",
    },
    {
      nickname: "ndc",
      userId: "fec0b11765a07de5960c70452f7d35f31985151",
      score: "100%",
      duration: "00:15:00",
      language: "Ruby",
      criterion: "169",
    },
    {
      nickname: "j4at",
      userId: "4aad50340de97049b501ce2ba6af5deb1716784",
      score: "100%",
      duration: "00:15:00",
      language: "Python 3",
      criterion: "179",
    },
    {
      nickname: "SuperMuppet",
      userId: "1c131774a94d84715aec68419216018d3320652",
      score: "100%",
      duration: "00:13:59",
      language: "Python 3",
      criterion: "220",
    },
    {
      nickname: "KaneyklovAleck",
      userId: "929a32931c811078ab286744570b24f05230652",
      score: "42%",
      duration: "00:14:43",
      language: "Python 3",
      criterion: "136",
    },
    {
      nickname: "Oladzsi",
      userId: "4f084d4e5fff42fc2a98ab08b518ac901589454",
      score: "0%",
      duration: "00:01:03",
      language: "C++",
      criterion: "495",
    },
    {
      nickname: "Piz20",
      userId: "d31049aca3b8ba649adead574ebc48351154305",
      score: "0%",
      duration: "00:15:00",
      language: "N/A",
    },
    {
      nickname: "elmaderas",
      userId: "a48eabc071c20d96362266c48c31387b6108793",
      score: "0%",
      duration: "00:15:00",
      language: "N/A",
    },
  ]);
  game.showSetRanking();

  game.newRound();
  game.setMultiplier("C#", 0.25);
  game.play([
    {
      nickname: "dtinth",
      userId: "1bc6963922756fd0de3a5fe3afd940245099983",
      score: "100%",
      duration: "00:07:42",
      language: "Ruby",
      criterion: "48",
    },
    {
      nickname: "DeerFutureMe",
      userId: "a3dbd9f4eb4cd67d9377ec73dd9363e76178174",
      score: "100%",
      duration: "00:12:53",
      language: "JavaScript",
      criterion: "107",
    },
    {
      nickname: "mikeIsGreat",
      userId: "9a1a336d821ffb83505f21e284a548af0846984",
      score: "100%",
      duration: "00:12:17",
      language: "C#",
      criterion: "297",
    },
    {
      nickname: "meltice",
      userId: "d169c6bbe059512ea069765430551caf2661773",
      score: "80%",
      duration: "00:14:52",
      language: "Python 3",
      criterion: "165",
    },
    {
      nickname: "umut3RC",
      userId: "9812420caac75582dee27aa0e3ba71817438084",
      score: "80%",
      duration: "00:06:04",
      language: "C",
      criterion: "547",
    },
    {
      nickname: "",
      userId: "bee6264d913c0b3eeb7c9a533596eba75864514",
      score: "60%",
      duration: "00:02:50",
      language: "Ruby",
      criterion: "56",
    },
    {
      nickname: "asmodee",
      userId: "dd6300ef10a2059f5592dcf2bca258aa0367252",
      score: "60%",
      duration: "00:11:39",
      language: "Python 3",
      criterion: "130",
    },
    {
      nickname: "Law104",
      userId: "5285c684a8d0f5cd6e6e1297e39435e59454194",
      score: "0%",
      duration: "00:15:00",
      language: "Python 3",
      criterion: "529",
    },
  ]);
  game.showSetRanking();
}
