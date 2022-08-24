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

interface RoundSettings {
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

export class Game {
  // Round setting
  roundSettings: RoundSettings = createDefaultRoundSettings();
  /**
   * @description view property determines which UI should be displayed at the moment
   */
  view: View = { type: "none" };
  playersInCurrentSet: Record<string, Player> = {};
  currentRoundNumber = 0;
  currentSetNumber = 1;

  /**
   * @description Start a new round with default round settings
   */
  newRound() {
    this.roundSettings = createDefaultRoundSettings();
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
}

/**
 * @internal Return default RoundSettings property to the Game Object
 * @returns
 */
function createDefaultRoundSettings(): RoundSettings {
  return {
    multipliers: {},
    bonus: {},
  };
}
