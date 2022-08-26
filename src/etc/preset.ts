import type { Lang } from "src/model";

export interface PresetBonus {
  langs: Partial<Lang[]>;
  flatBonus: number;
  // multipiler?: number;
}

export const FlavorsOfC: PresetBonus = {
  langs: ["C", "C#", "C++"],
  flatBonus: 10,
};

export const IMakeAppsBtw: PresetBonus = {
  langs: ["Kotlin", "Swift", "Dart"],
  flatBonus: 5,
};

export const RealProgrammer: PresetBonus = {
  langs: ["Rust", "Pascal", "Haskell"],
  flatBonus: 20,
};

/**
 * @description This preset replaced ScriptKiddie
 */
export const BuffTheOp: PresetBonus = {
  langs: ["Python 3", "Bash", "Ruby"],
  flatBonus: 5,
};

export const OOPSucks: PresetBonus = {
  langs: ["Groovy", "Java", "Go"],
  flatBonus: 10,
};

export const IMakeWebBtw: PresetBonus = {
  langs: ["Perl", "PHP", "JavaScript"],
  flatBonus: 5,
};

export const KraTikNamMicrosoft: PresetBonus = {
  langs: ["C#", "TypeScript", "F#", "VB.NET"],
  flatBonus: 10,
};
