import { palette, type Settings } from "./settings"

// Percent of the accent color blended into the bubble, over the theme's first raised surface.
const tintPercent = { none: 0, subtle: 5, medium: 10, strong: 18 }
const railPercent = { faint: 25, normal: 45, strong: 70 }

const scopes = {
  dark: ':root[data-color-scheme="dark"]',
  light: ':root[data-color-scheme="light"]',
  both: ":root",
}

export function buildCss(settings: Settings): string {
  const scope = scopes[settings.mode]
  const rules: string[] = []

  if (settings.width !== "auto") {
    rules.push(
      `${scope} [data-component="user-message"] [data-slot="user-message-body"] { width: ${settings.width} !important; max-width: none !important; }`,
      `${scope} [data-component="user-message"] [data-slot="user-message-text"] { display: block !important; width: 100% !important; box-sizing: border-box !important; }`,
    )
  }

  palette(settings).forEach((color, index) => {
    // Index 0 also covers rows the tagger hasn't reached yet, so the first color is the fallback.
    const row = index === 0 ? "" : ` [data-turn-color="${index}"]`

    const bubble: string[] = []
    const tint = tintPercent[settings.tint]
    if (tint > 0) {
      const background = `color-mix(in srgb, ${color} ${tint}%, var(--v2-background-bg-layer-01))`
      bubble.push(`--user-message-bubble: ${background} !important;`, `background: ${background} !important;`)
    }
    if (settings.stripe !== "none") {
      const offset = settings.stripe === "right" ? "-3px" : "3px"
      bubble.push(`box-shadow: inset ${offset} 0 0 ${color} !important;`)
    }
    if (bubble.length > 0) {
      rules.push(
        `${scope}${row} [data-component="user-message"]:not([data-pending]) [data-slot="user-message-text"] { ${bubble.join(" ")} }`,
      )
    }

    if (settings.rail) {
      const rail = `color-mix(in srgb, ${color} ${railPercent[settings.railStrength]}%, transparent)`
      const target = index === 0 ? "[data-timeline-row][data-message-id]" : `[data-timeline-row][data-message-id][data-turn-color="${index}"]`
      const padding = index === 0 ? " padding-inline-start: 14px !important;" : ""
      rules.push(`${scope} ${target} { box-shadow: inset 2px 0 0 ${rail} !important;${padding} }`)
    }
  })

  if (settings.textColor) {
    rules.push(
      `${scope} [data-component="user-message"]:not([data-pending]) [data-slot="user-message-text"] { color: ${settings.textColor} !important; }`,
    )
  }
  if (settings.pendingTextColor) {
    rules.push(
      `${scope} [data-component="user-message"][data-pending] [data-slot="user-message-text"] { color: ${settings.pendingTextColor} !important; }`,
    )
  }

  return rules.join("\n")
}
