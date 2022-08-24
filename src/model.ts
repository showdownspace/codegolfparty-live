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

interface CodinGameResult {
  nickname: string;
  userId: string;
  score: string;
  duration: string;
  language: string;
  criterion?: string;
}

interface ProcessedResult extends CodinGameResult {
  languageMultiplier?: number;
  originalCount: number;
  adjustedCount: number;
  testcaseScore: number;
  baseScore: number;
  adjustedScore: number;
}

interface RoundSettings extends RoundConfig {
  multipliers: { [lang: string]: number };
  bonus: { [lang: string]: number };
}

export type View = RoundView | NoneView | SetRankingView;

export interface RoundView {
  type: "round";
  results: ProcessedResult[];
  modifiers: Modifier[];
  roundNumber: number;
}

export interface Modifier {
  name: string;
  type: "nerf" | "buff" | "bonus";
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
}

export type LanguagesOccurences = Partial<Record<Lang, number>>;

export interface LanguageUsageHistory {
  rounds: Partial<{
    roundCount: number;
    langs: LanguagesOccurences;
  }>[];
  total: Partial<Record<Lang, number>>;
}

export class Game {
  // Round setting
  roundSettings: RoundSettings & RoundConfig = createDefaultRoundSettings();
  /**
   * @description view property determines which UI should be displayed at the moment
   */
  view: View = { type: "none" };
  playersInCurrentSet: Record<string, Player> = {};
  langUsedHistory: LanguageUsageHistory = {
    total: {},
    rounds: [],
  };
  currentRoundNumber = 0;
  currentSetNumber = 1;

  // Maximum percent of language used before deduction penalty in language autobalancing
  penaltyGraceValue = 0.15;

  /**
   * @description Start a new round with default round settings
   */
  newRound(config?: RoundConfig) {
    console.log(config);
    this.roundSettings = createDefaultRoundSettings(config);
    this.currentRoundNumber += 1;
  }

  /**
   * @descrition Apply score multiplier for a language only for the current round
   * @param language
   * @param multiplier
   */
  setLanguageMultiplier(language: Lang, multiplier: number) {
    this.roundSettings.multipliers[language] = multiplier;
  }

  /**
   * @description Apply flat score bonus for a language only for the current round
   * @param language
   * @param bonus
   */
  setLanguageBonus(language: Lang, bonus: number) {
    this.roundSettings.bonus[language] = bonus;
  }

  /**
   * @description Append the array of scores
   * @param inResults
   */
  play(inResults: CodinGameResult[]) {
    const results = inResults as ProcessedResult[];
    const modifiers: Modifier[] = [];

    // Append the languages usage history
    const latestLangStats = {
      roundCount: this.currentRoundNumber,
      langs: getLangsOccurance(results),
    };
    this.langUsedHistory.rounds.push(latestLangStats);
    //Add languages usage to the total languages count
    for (const [lang, times] of Object.entries(latestLangStats.langs)) {
      this.langUsedHistory.total[lang] += times;
    }

    // Apply the autobalance multipiler under the GM condition
    switch (this.roundSettings.langAutoBalance) {
      case "allRounds":
        this.computeLangUsagePenalty(this.langUsedHistory.total, results);
        break;
      case "currentRound":
        this.computeLangUsagePenalty(latestLangStats.langs, results);
        break;
      case "lastRound":
        this.computeLangUsagePenalty(
          this.langUsedHistory.rounds[this.currentRoundNumber - 2].langs,
          results
        );
        break;
      default:
        break;
    }

    // Calculate & Apply multipliers
    for (const [language, multiplier] of Object.entries(
      this.roundSettings.multipliers
    )) {
      modifiers.push({
        name: `${language} x${multiplier}`,
        type: multiplier > 1 ? "nerf" : "buff",
      });
    }
    for (const row of results) {
      row.languageMultiplier =
        this.roundSettings.multipliers[row.language] ?? 1;
      row.originalCount = +(row.criterion || Infinity);
      row.adjustedCount = row.originalCount * (row.languageMultiplier ?? 1);
      row.testcaseScore = (parseInt(row.score) || 0) / 100;
    }

    // Compute the duration of each player
    const parseDuration = (x) => {
      const parts = x.split(":");
      let out = +parts.pop() || 0;
      out += (+parts.pop() || 0) * 60;
      out += (+parts.pop() || 0) * 60 * 60;
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
    for (const [lang, bonus] of Object.entries(this.roundSettings.bonus)) {
      modifiers.push({
        name: `${lang} +${bonus}`,
        type: "bonus",
      });
    }
    for (const row of results) {
      row.adjustedScore += this.roundSettings.bonus[row.language] ?? 0;
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

    // Applies the total score and the modifier used
    this.view = {
      type: "round",
      results,
      modifiers,
      roundNumber: this.currentRoundNumber,
    };

    // Delete the previous round settings
    delete this.roundSettings;
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
    usage: Partial<Record<Lang, number>>,
    results: ProcessedResult[]
  ) {
    for (const [lang, times] of Object.entries(usage)) {
      // code length multipiler is between 1 and 1.5
      const multipiler = clamp(
        1 + times / results.length - this.roundSettings?.penaltyGraceValue,
        1,
        1.5
      );

      console.log(
        `${lang}-USAGE:${((times / results.length) * 100).toFixed(
          2
        )}%-MUL:${multipiler}`
      );
      this.setLanguageMultiplier(
        lang as Lang,
        parseFloat(multipiler.toFixed(2))
      );
    }
  }
}

/**
 * @internal Return default RoundSettings property to the Game Object
 * @returns
 */
function createDefaultRoundSettings(
  config?: RoundConfig
): RoundSettings & RoundConfig {
  console.log(config);
  return {
    multipliers: {},
    bonus: {},
    langAutoBalance: config?.langAutoBalance ?? "none",
    autoScaleMultipiler: config?.autoScaleMultipiler ?? false,
    penaltyGraceValue: config.penaltyGraceValue ?? 0.15,
  };
}

function getLangsOccurance(results: CodinGameResult[]) {
  const langsWithDupe = results.map((result) => result.language);
  const langsArrUnqiue = langsWithDupe.filter((lang, index, self) => {
    return self.indexOf(lang) === index;
  });

  function getOccurrence(array, value) {
    var count = 0;
    array.forEach((v) => v === value && count++);
    return count;
  }

  const langsOccurences: LanguagesOccurences = {};

  langsArrUnqiue.forEach(
    (lang) => (langsOccurences[lang] = getOccurrence(langsWithDupe, lang))
  );

  return langsOccurences;
}
