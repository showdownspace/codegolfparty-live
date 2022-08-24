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
}

export interface EffectiveModifiers {
  multipliers: { [lang in Lang]?: number };
  bonuses: { [lang in Lang]?: number };
  modifiers: Modifier[];
}

export interface Round {
  setNumber: number;
  roundNumber: number;
  config: RoundConfig;
}

export type View = RoundResultView | RoundInfoView | NoneView | SetRankingView;

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
  setNumber: number;
  entries: RankingEntry[];
}

export interface RankingEntry {
  name: string;
  points: number;
}

export interface NoneView {
  type: "none";
}

export interface Player {
  name: string;
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
   * @description Which UI should be displayed at the moment
   */
  view: View = { type: "none" };

  playersInCurrentSet: Record<string, Player> = {};

  /**
   * @description Language usage stats for past rounds
   */
  languageUsageStats: LanguageUsageStats = {
    total: {},
    history: [],
  };
  nextRoundNumber = 1;
  currentSetNumber = 1;

  // Maximum percent of language used before deduction penalty in language autobalancing
  penaltyGraceValue = 0.15;

  /**
   * @description Start a new round with default round settings
   */
  newRound(config: RoundConfig) {
    this._currentRound = {
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

    return {
      modifiers,
      multipliers,
      bonuses,
    };
  }

  /**
   * @description Append the array of scores
   * @param inResults
   */
  play(inResults: CodinGameResult[]) {
    const results = inResults as ProcessedResult[];

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

    // Apply language bonus
    for (const row of results) {
      row.adjustedScore += bonuses[row.language as Lang] ?? 0;
    }

    // Sort by score
    // Apply first-of-language bonus

    // Round up score
    results.sort((a, b) => b.adjustedScore - a.adjustedScore);
    for (const row of results) {
      row.baseScore = Math.round(row.baseScore);
      row.adjustedScore = Math.round(row.adjustedScore);
    }

    // Add score
    for (const row of results) {
      this.getPlayerInCurrentSet(row).score += row.adjustedScore;
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
  }

  /**
   * @description Change the UI of the website to show the total score (so far) and ranking
   */
  showSetRanking() {
    this.view = {
      type: "set-ranking",
      setNumber: 1,
      entries: Object.values(this.playersInCurrentSet)
        .map((player) => ({
          name: player.name,
          points: player.score,
        }))
        .sort((a, b) => b.points - a.points),
    };
  }

  private getPlayerInCurrentSet(row: ProcessedResult) {
    if (!this.playersInCurrentSet[row.userId]) {
      this.playersInCurrentSet[row.userId] = {
        name: row.nickname,
        score: 0,
      };
    }
    return this.playersInCurrentSet[row.userId];
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
