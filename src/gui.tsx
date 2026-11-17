import { createEffect } from "solid-js"
import { Command, Plugin, SettingsPage, Style } from "@opencode/plugin/gui"
import { buildCss } from "./css"
import { definition } from "./definition"
import { SettingsView } from "./page"
import { normalize, palette } from "./settings"
import { createTagger } from "./tagger"

export default Plugin.define({
  ...definition,
  setup(ctx) {
    const settings = () => normalize(ctx.stores.settings.value)

    ctx.add(Style, () => buildCss(settings()))

    const tagger = createTagger({
      sessions: () => ctx.sessions.list(),
      colors: () => palette(settings()).length,
    })
    createEffect(() => {
      palette(settings())
      tagger.schedule()
    })

    ctx.add(SettingsPage, {
      id: ctx.id,
      icon: "sliders",
      get title() {
        return ctx.t("title")
      },
      get entries() {
        return ["mode", "primary", "alternate", "secondary", "width", "stripe", "tint", "rail", "railStrength"].map(
          (id) => ({ id, title: ctx.t(`${id}.title`), description: ctx.t(`${id}.description`) }),
        )
      },
      render: () => <SettingsView />,
    })

    ctx.add(Command, () => ({
      id: "diag",
      title: ctx.t("diag.title"),
      run: () => {
        const stats = tagger.stats()
        const current = settings()
        ctx.toast.show({
          title: ctx.t("diag.toast"),
          description: [
            `plugin: ${ctx.id}`,
            `app version: ${ctx.app.version}`,
            `scheme: ${document.documentElement.getAttribute("data-color-scheme")} (applies in: ${current.mode})`,
            `colors: ${palette(current).join(", ")}`,
            `timeline rows: ${stats.rows}, tagged: ${stats.tagged}, sessions read: ${stats.sessions}`,
          ].join("\n"),
          duration: 30000,
        })
      },
    }))

    return () => tagger.dispose()
  },
})
