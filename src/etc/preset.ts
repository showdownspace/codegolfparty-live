import type { Lang } from "src/model";

export interface PresetBonus {
  langs: Partial<Lang[]>;
  flatBonus: number;
  multipiler?: number;
}

export const FlavorOfC: PresetBonus = {
  langs: ["C", "C#", "C++"],
  flatBonus: 10,
};

export const IMakeAppsBtw: PresetBonus = {
  langs: ["Kotlin", "Swift", "Dart"],
  flatBonus: 5,
};

export const RealProgrammer: PresetBonus = {
  langs: ["Bash", "Pascal", "Haskell"],
  flatBonus: 20,
};

export const ScriptKiddie: PresetBonus = {
  langs: ["JavaScript", "Python 3", "Rust"],
  flatBonus: 5,
};

export const OOPSucks: PresetBonus = {
  langs: ["C#", "Java", "Go"],
  flatBonus: 10,
};

export const IMakeWebBtw: PresetBonus = {
  langs: ["TypeScript", "PHP", "Perl"],
  flatBonus: 5,
};
