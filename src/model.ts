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
  criterion: string;
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
  number: number;
  multipliers: { [lang: string]: number };
}

export type View = RoundView | NoneView;

export interface RoundView {
  type: "round";
  results: ProcessedResult[];
  modifiers: string[];
  roundNumber: number;
}

export interface NoneView {
  type: "none";
}

export class Game {
  roundSettings: RoundSettings = createDefaultRoundSettings(0);
  view: View = { type: "none" };
  round(n: number) {
    this.roundSettings = createDefaultRoundSettings(n);
    return this;
  }
  setMultiplier(language: Lang, multiplier = 1) {
    this.roundSettings.multipliers[language] = multiplier;
    return this;
  }
  play(inResults: CodinGameResult[]) {
    const results = inResults as ProcessedResult[];
    const modifiers: string[] = [];

    // Apply multipliers
    for (const [language, multiplier] of Object.entries(
      this.roundSettings.multipliers
    )) {
      modifiers.push(`${language} x${multiplier}`);
    }
    for (const row of results) {
      row.languageMultiplier =
        this.roundSettings.multipliers[row.language] ?? 1;
      row.originalCount = +(row.criterion || Infinity);
      row.adjustedCount = row.originalCount * (row.languageMultiplier ?? 1);
      row.testcaseScore = (parseInt(row.score) || 0) / 100;
    }

    // Sort rank
    const parseDuration = (x) => {
      const parts = x.split(":");
      let out = +parts.pop() || 0;
      out += (+parts.pop() || 0) * 60;
      out += (+parts.pop() || 0) * 60 * 60;
      return out;
    };
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
    // Sort by score
    // Apply first-of-language bonus

    this.view = {
      type: "round",
      results,
      modifiers,
      roundNumber: this.roundSettings.number,
    };
    delete this.roundSettings;
  }
}
function createDefaultRoundSettings(n: number): RoundSettings {
  return {
    number: n,
    multipliers: {},
  };
}
