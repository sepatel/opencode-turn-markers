import { Plugin, Store } from "@opencode/plugin/gui"
import { StoredSettings } from "./settings"

export const definition = Plugin.define({
  stores: {
    settings: Store.global(StoredSettings, {}),
  },
  i18n: {
    en: {
      title: "Turn markers",
      description: "Mark where each question starts and how far its answer runs in the session timeline.",
      reset: "Reset to defaults",

      "section.appearance": "Appearance",
      "section.question": "Question",
      "section.rail": "Side line",

      "mode.title": "Apply in",
      "mode.description": "Which color schemes the markers show in.",
      "mode.dark": "Dark mode only",
      "mode.light": "Light mode only",
      "mode.both": "Dark and light mode",

      "primary.title": "Color",
      "primary.description": "Any CSS color, such as #9d7cd8 or rebeccapurple.",
      "alternate.title": "Alternate colors",
      "alternate.description": "Switch to a second color on every other exchange, so neighbours are easy to tell apart.",
      "secondary.title": "Second color",
      "secondary.description": "Used on every other exchange.",

      "width.title": "Width",
      "width.description": "How wide question bubbles are. App default fits the bubble to its text.",
      "width.auto": "App default",
      "width.full": "Full width",

      "stripe.title": "Accent stripe",
      "stripe.description": "A bar in the exchange's color on one edge of the question bubble.",
      "stripe.right": "Right edge",
      "stripe.left": "Left edge",
      "stripe.none": "None",

      "tint.title": "Background tint",
      "tint.description": "How much of the exchange's color shows in the bubble background.",
      "tint.none": "None",
      "tint.subtle": "Subtle",
      "tint.medium": "Medium",
      "tint.strong": "Strong",

      "rail.title": "Show side line",
      "rail.description": "A line down the left edge from each question to the end of its answer.",
      "railStrength.title": "Strength",
      "railStrength.description": "How visible the side line is.",
      "railStrength.faint": "Faint",
      "railStrength.normal": "Normal",
      "railStrength.strong": "Strong",

      "diag.title": "Diagnose turn markers",
      "diag.toast": "Turn markers diagnostics",
    },
  },
})
