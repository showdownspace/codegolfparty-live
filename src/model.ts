import { clamp, result } from "lodash-es";

export type Lang =
  | "Bash"
  | "C"
  | "C#"
  | "C++"
  | "Clojure"
  | "D"
  | "Dart"
  | "F#"
  | "Go"
  | "Groovy"
  | "Haskell"
  | "Java"
  | "JavaScript"
  | "Kotlin"
  | "Lua"
  | "OCaml"
  | "Pascal"
  | "Perl"
  | "PHP"
  | "Python 3"
  | "Ruby"
  | "Rust"
  | "Scala"
  | "Swift"
  | "TypeScript"
  | "VB.NET";

const mapLang: Partial<Record<Lang, string>> = {
  "Python 3": "Python",
  JavaScript: "JS",
};

var players: string[] = []

function formatLang(lang: string) {
  return mapLang[lang as Lang] || lang;
}

interface CodinGameResult {
  nickname: string;
  userId: string;
  score: string;
  duration: string;
  language: string;
  criterion?: string;
}

interface ProcessedResult extends CodinGameResult {
  displayLanguage: string;
  languageMultiplier?: number;
  originalCount: number;
  adjustedCount: number;
  testcaseScore: number;
  baseScore: number;
  adjustedScore: number;
}

export interface RoundConfig {
  /**
   * @description Automatically adjust the language multipiler to the inverse amount of times the language is used
   */
  langAutoBalance?: "none" | "allRounds" | "lastRound" | "currentRound";
  /**
   * @description Automatically raise the minimum score multipiler as the round goes on
   */
  autoScaleMultipiler?: boolean;
  /**
   * @description Maximum percent of language used before deduction penalty in language autobalancing
   * @default 0.15
   */
  penaltyGraceValue?: number;
  /**
   * @description Multiplier when using a language (manual override).
   */
  multipliers?: { [lang in Lang]?: number };
  /**
   * @description Bonus when using a language.
   */
  bonuses?: { [lang in Lang]?: number };
  /**
   * @description Shortest bonus.
   */
  shortestOfLanguageBonus?: number;
  /**
   * @description Fast bonus.
   */
  fastBonus?: number;
}

export interface EffectiveModifiers {
  multipliers: { [lang in Lang]?: number };
  bonuses: { [lang in Lang]?: number };
  modifiers: Modifier[];
}

export interface Round {
  finished: boolean;
  setNumber: number;
  roundNumber: number;
  config: RoundConfig;
}

export type View =
  | RoundResultView
  | RoundInfoView
  | TextView
  | SetRankingView
  | OverallRankingView;

export interface Modifier {
  name: string;
  type: "nerf" | "buff" | "bonus" | "mystery";
}

export interface RoundResultView {
  type: "round-result";
  results: ProcessedResult[];
  modifiers: Modifier[];
  roundNumber: number;
  setNumber: number;
}

export interface RoundInfoView {
  type: "round-info";
  modifiers: Modifier[];
  roundNumber: number;
  setNumber: number;
}

export interface SetRankingView {
  type: "set-ranking";
  roundNumber: number;
  setNumber: number;
  entries: RankingEntry[];
}

export interface OverallRankingView {
  type: "overall-ranking";
  setNumber: number;
  sets: number[];
  entries: (RankingEntry & { pointsBySet: Record<number, number> })[];
}

export interface RankingEntry {
  name: string;
  points: number;
}

export interface TextView {
  type: "text";
  text: string;
}

export interface Player {
  name: string;
  scoreParts: Record<string, number>;
  score: number;
}

export type LanguagesOccurences = Partial<Record<Lang, number>>;

export interface LanguageUsageStats {
  history: RoundLanguageUsageStats[];
  total: LanguagesOccurences;
}

export interface RoundLanguageUsageStats {
  roundNumber: number;
  langs: LanguagesOccurences;
}

export class Game {
  /**
   * The current round
   */
  private _currentRound?: Round;

  get currentRound() {
    if (!this._currentRound) {
      throw new Error("No current round! Call newRound() first.");
    }
    return this._currentRound;
  }

  /**
   * @description Which UI should be displayed on the preview screen
   */
  view: View = { type: "text", text: "Welcome to Code Golf Party #1!" };
  /**
   * @description Which UI should be displayed to the audience
   */
  liveView = this.view;

  playersInCurrentSet: Record<string, Player> = {};
  playersInGame: Record<string, Player> = {};

  /**
   * @description Language usage stats for past rounds
   */
  languageUsageStats: LanguageUsageStats = {
    total: {},
    history: [],
  };
  nextRoundNumber = 1;
  currentSetNumber = 1;
  setIsFinished = false;

  // Maximum percent of language used before deduction penalty in language autobalancing
  penaltyGraceValue = 0.15;

  /**
   * @description Start a new round with default round settings
   */
  newRound(config: RoundConfig) {
    if (this.setIsFinished) {
      this.currentSetNumber++;
      this.setIsFinished = false;
      this.nextRoundNumber = 1;
      this.playersInCurrentSet = {};
    }
    if (this._currentRound && !this._currentRound.finished) {
      throw new Error(
        "Cannot start a new round before the current one is finished!"
      );
    }
    this._currentRound = {
      finished: false,
      setNumber: this.currentSetNumber,
      roundNumber: this.nextRoundNumber,
      config: config,
    };
    this.nextRoundNumber += 1;

    // Display
    this.view = {
      type: "round-info",
      modifiers: this.getEffectiveModifiers().modifiers,
      setNumber: this.currentRound.setNumber,
      roundNumber: this.currentRound.roundNumber,
    };
  }

  private getEffectiveModifiers(
    currentRoundStats?: RoundLanguageUsageStats
  ): EffectiveModifiers {
    const modifiers: Modifier[] = [];
    const multipliers = this.currentRound.config.multipliers ?? {};

    // Apply the autobalance multipiler under the GM condition
    const apply = (lang: Lang, multiplier: number) => {
      multipliers[lang] = multiplier;
    };
    switch (this.currentRound.config.langAutoBalance) {
      case "allRounds": {
        this.computeLangUsagePenalty(this.languageUsageStats.total, apply);
        break;
      }
      case "currentRound": {
        this.computeLangUsagePenalty(currentRoundStats?.langs || {}, apply);
        if (!currentRoundStats) {
          modifiers.push({
            name: "Auto-balance x??",
            type: "mystery",
          });
        }
        break;
      }
      case "lastRound": {
        const history = this.languageUsageStats.history;
        this.computeLangUsagePenalty(history[history.length - 1].langs, apply);
        break;
      }
    }

    for (const [lang, multiplier] of Object.entries(multipliers)) {
      if (multiplier !== 1) {
        modifiers.push({
          name: `${formatLang(lang)} x${multiplier}`,
          type: multiplier > 1 ? "nerf" : "buff",
        });
      }
    }

    const bonuses = this.currentRound.config.bonuses || {};
    for (const [lang, bonus] of Object.entries(bonuses)) {
      modifiers.push({
        name: `${formatLang(lang)} +${bonus}`,
        type: "bonus",
      });
    }

    if (this.currentRound.config.fastBonus) {
      modifiers.push({
        name: "Fast bonus",
        type: "bonus",
      });
    }

    if (this.currentRound.config.shortestOfLanguageBonus) {
      const n = this.currentRound.config.shortestOfLanguageBonus;
      modifiers.push({
        name: `Shortest of language +${n}`,
        type: "bonus",
      });
    }

    return {
      modifiers,
      multipliers,
      bonuses,
    };
  }

  /**
   * @description Filter out user that's not in the list
   * @param inPlayer 
   */
   addPlayers(inPlayer: string[]) {
    players = inPlayer
  }

  /**
   * @description Append the array of scores
   * @param inResults
   */
  play(inResults: CodinGameResult[]) {
    if (this.currentRound.finished) {
      throw new Error("Cannot play after the round is finished!");
    }

    const results = players.length === 0 ? inResults as ProcessedResult[] : inResults.filter( data => players.includes(data.userId)) as ProcessedResult[];

    // Append the languages usage history
    const currentRoundStats: RoundLanguageUsageStats = {
      roundNumber: this.currentRound.roundNumber,
      langs: getLangsOccurance(results),
    };

    const { multipliers, bonuses, modifiers } =
      this.getEffectiveModifiers(currentRoundStats);

    // Calculate & Apply multipliers
    for (const row of results) {
      row.displayLanguage = formatLang(row.language as Lang);
      row.languageMultiplier = multipliers[row.language as Lang] ?? 1;
      row.originalCount = +(row.criterion || Infinity);
      row.adjustedCount = row.originalCount * (row.languageMultiplier ?? 1);
      row.testcaseScore = (parseInt(row.score) || 0) / 100;
    }

    // Compute the duration of each player
    const parseDuration = (x: string) => {
      const parts = x.split(":");
      let out = +parts.pop()! || 0;
      out += (+parts.pop()! || 0) * 60;
      out += (+parts.pop()! || 0) * 60 * 60;
      return out;
    };
    // Sort ranking
    results.sort(
      (a, b) => parseDuration(a.duration) - parseDuration(b.duration)
    );
    results.sort((a, b) => a.adjustedCount - b.adjustedCount);
    results.sort((a, b) => b.testcaseScore - a.testcaseScore);

    // Compute base score
    let nextScore = 100;
    for (const row of results) {
      if (!Number.isFinite(row.adjustedCount)) {
        row.baseScore = 0;
      } else {
        row.baseScore = nextScore * row.testcaseScore;
        nextScore -= 1;
      }
      row.adjustedScore = row.baseScore;
    }
    results.sort((a, b) => b.baseScore - a.baseScore);

    // Bonus
    const bonus = (row: ProcessedResult, addition: number) => {
      row.adjustedScore += addition * row.testcaseScore;
    };

    // Apply language bonus
    for (const row of results) {
      bonus(row, bonuses[row.language as Lang] ?? 0);
    }

    // Apply shortest-of-language bonus
    if (this.currentRound.config.shortestOfLanguageBonus) {
      const n = this.currentRound.config.shortestOfLanguageBonus;
      const given = new Set();
      for (const row of results) {
        if (!given.has(row.language)) {
          given.add(row.language);
          bonus(row, n);
        }
      }
    }

    // Apply fast score
    if (this.currentRound.config.fastBonus) {
      let n = this.currentRound.config.fastBonus;
      const sortedByTime = [...results].sort(
        (a, b) => parseDuration(a.duration) - parseDuration(b.duration)
      );
      for (const row of sortedByTime) {
        bonus(row, n);
        n -= 2;
        if (n < 0) {
          break;
        }
      }
    }

    // Round up score
    results.sort((a, b) => b.adjustedScore - a.adjustedScore);
    for (const row of results) {
      row.baseScore = Math.round(row.baseScore);
      row.adjustedScore = Math.round(row.adjustedScore);
    }

    // Add score
    for (const row of results) {
      const player = this.getPlayerInCurrentSet(row);
      player.score += row.adjustedScore;
      player.scoreParts[this.currentRound.roundNumber] = row.adjustedScore;

      const gamePlayer = this.getPlayerInGame(row);
      gamePlayer.score = Math.max(gamePlayer.score, player.score);
      gamePlayer.scoreParts[this.currentSetNumber] = player.score;
    }

    // Display
    this.view = {
      type: "round-result",
      results,
      modifiers,
      setNumber: this.currentRound.setNumber,
      roundNumber: this.currentRound.roundNumber,
    };

    // Update stats
    this.languageUsageStats.history.push(currentRoundStats);
    for (const [lang, times] of Object.entries(currentRoundStats.langs)) {
      this.languageUsageStats.total[lang as Lang] =
        (this.languageUsageStats.total[lang as Lang] || 0) + times;
    }

    // Finalize
    this.currentRound.finished = true;
  }

  /**
   * @description Change the UI of the website to show the total score (so far) and ranking
   */
  showSetRanking() {
    this.view = {
      type: "set-ranking",
      setNumber: this.currentSetNumber,
      roundNumber: this.currentRound.roundNumber,
      entries: Object.values(this.playersInCurrentSet)
        .map((player) => ({
          name: player.name,
          points: player.score,
        }))
        .sort((a, b) => b.points - a.points),
    };
  }

  finishSet() {
    if (this.setIsFinished) {
      throw new Error("Set is already finished");
    }
    this.view = {
      type: "overall-ranking",
      setNumber: this.currentSetNumber,
      sets: Array(this.currentSetNumber)
        .fill(0)
        .map((_, i) => i + 1),
      entries: Object.values(this.playersInGame)
        .map((player) => ({
          name: player.name,
          points: player.score,
          pointsBySet: player.scoreParts,
        }))
        .sort((a, b) => b.points - a.points),
    };
    this.setIsFinished = true;
  }

  private getPlayerInCurrentSet(row: ProcessedResult) {
    if (!this.playersInCurrentSet[row.userId]) {
      this.playersInCurrentSet[row.userId] = {
        name: row.nickname,
        scoreParts: {},
        score: 0,
      };
    }
    return this.playersInCurrentSet[row.userId];
  }

  private getPlayerInGame(row: ProcessedResult) {
    if (!this.playersInGame[row.userId]) {
      this.playersInGame[row.userId] = {
        name: row.nickname,
        scoreParts: {},
        score: 0,
      };
    }
    return this.playersInGame[row.userId];
  }

  private computeLangUsagePenalty(
    usage: LanguagesOccurences,
    apply: (lang: Lang, penalty: number) => void
  ) {
    const totalSubmissions = Object.values(usage).reduce((a, b) => a + b, 0);
    for (const [lang, times] of Object.entries(usage)) {
      const penaltyGraceValue =
        this.currentRound.config.penaltyGraceValue ?? 0.15;
      // code length multipiler is between 1 and 1.5
      const multipiler = clamp(
        1 + times / totalSubmissions - penaltyGraceValue,
        1,
        1.5
      );

      console.log(
        `${lang}-USAGE:${((times / totalSubmissions) * 100).toFixed(
          2
        )}%-MUL:${multipiler}`
      );
      apply(lang as Lang, parseFloat(multipiler.toFixed(2)));
    }
  }

  goLive() {
    this.liveView = this.view;
  }

  showText(text: string) {
    this.view = { type: "text", text };
  }
}

function getLangsOccurance(results: CodinGameResult[]) {
  const langsWithDupe = results.map((result) => result.language as Lang);
  const langsArrUnique = langsWithDupe.filter((lang, index, self) => {
    return self.indexOf(lang) === index;
  });

  function getOccurrence(array: any[], value: any) {
    var count = 0;
    array.forEach((v) => v === value && count++);
    return count;
  }

  const langsOccurences: LanguagesOccurences = {};

  langsArrUnique.forEach(
    (lang) => (langsOccurences[lang] = getOccurrence(langsWithDupe, lang))
  );

  return langsOccurences;
}
