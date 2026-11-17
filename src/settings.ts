import { Schema } from "effect"

export const modes = ["dark", "light", "both"] as const
export const widths = ["auto", "50%", "60%", "70%", "80%", "90%", "100%"] as const
export const stripes = ["right", "left", "none"] as const
export const tints = ["none", "subtle", "medium", "strong"] as const
export const strengths = ["faint", "normal", "strong"] as const

export interface Settings {
  mode: (typeof modes)[number]
  colors: [string, string]
  alternate: boolean
  width: (typeof widths)[number]
  stripe: (typeof stripes)[number]
  tint: (typeof tints)[number]
  rail: boolean
  railStrength: (typeof strengths)[number]
}

export const defaults: Settings = {
  mode: "dark",
  colors: ["#9d7cd8", "#fab283"],
  alternate: true,
  width: "70%",
  stripe: "right",
  tint: "subtle",
  rail: true,
  railStrength: "normal",
}

// Every field is optional and loosely typed, so a stored value from an older or newer version still decodes.
// A store that fails to decode fails the plugin's setup; normalize() does the real validation instead.
export const StoredSettings = Schema.Struct({
  mode: Schema.optional(Schema.String),
  primary: Schema.optional(Schema.String),
  secondary: Schema.optional(Schema.String),
  alternate: Schema.optional(Schema.Boolean),
  width: Schema.optional(Schema.String),
  stripe: Schema.optional(Schema.String),
  tint: Schema.optional(Schema.String),
  rail: Schema.optional(Schema.Boolean),
  railStrength: Schema.optional(Schema.String),
})

export type Stored = typeof StoredSettings.Type

function pick<T extends string>(choices: readonly T[], value: string | undefined, fallback: T): T {
  return choices.find((choice) => choice === value) ?? fallback
}

export function isColor(value: string | undefined): value is string {
  return !!value && CSS.supports("color", value)
}

export function normalize(stored: Stored): Settings {
  return {
    mode: pick(modes, stored.mode, defaults.mode),
    colors: [
      isColor(stored.primary) ? stored.primary : defaults.colors[0],
      isColor(stored.secondary) ? stored.secondary : defaults.colors[1],
    ],
    alternate: stored.alternate ?? defaults.alternate,
    width: pick(widths, stored.width, defaults.width),
    stripe: pick(stripes, stored.stripe, defaults.stripe),
    tint: pick(tints, stored.tint, defaults.tint),
    rail: stored.rail ?? defaults.rail,
    railStrength: pick(strengths, stored.railStrength, defaults.railStrength),
  }
}

export function palette(settings: Settings): string[] {
  return settings.alternate ? [...settings.colors] : [settings.colors[0]]
}
