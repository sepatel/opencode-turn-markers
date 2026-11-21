import { Show, type JSX } from "solid-js"
import { usePlugin } from "@opencode/plugin/gui"
import type { definition } from "./definition"
import { defaults, isColor, modes, normalize, strengths, stripes, tints, widths, type Stored } from "./settings"

export function SettingsView() {
  const ctx = usePlugin<typeof definition>()
  const ui = ctx.ui
  const store = ctx.stores.settings
  const settings = () => normalize(store.value)

  function set<K extends keyof Stored>(key: K, value: Stored[K]) {
    store.update((draft) => {
      draft[key] = value
    })
  }

  const widthLabel = (width: (typeof widths)[number]) =>
    width === "auto" ? ctx.t("width.auto") : width === "100%" ? ctx.t("width.full") : width

  return (
    <ui.SettingsLayout
      title={ctx.t("title")}
      description={ctx.t("description")}
      actions={
        <ui.Button variant="ghost" size="small" onClick={() => store.set({})}>
          {ctx.t("reset")}
        </ui.Button>
      }
    >
      <ui.SettingsSection title={ctx.t("section.appearance")}>
        <ui.SettingsRow id="mode" title={ctx.t("mode.title")} description={ctx.t("mode.description")}>
          <ui.Select
            label={ctx.t("mode.title")}
            options={modes.map((value) => ({ value, label: ctx.t(`mode.${value}`) }))}
            value={settings().mode}
            onChange={(value) => set("mode", value)}
          />
        </ui.SettingsRow>
        <ui.SettingsRow id="primary" title={ctx.t("primary.title")} description={ctx.t("primary.description")}>
          <ColorInput
            label={ctx.t("primary.title")}
            value={store.value.primary ?? defaults.colors[0]}
            onInput={(value) => set("primary", value)}
          />
        </ui.SettingsRow>
        <ui.SettingsRow id="alternate" title={ctx.t("alternate.title")} description={ctx.t("alternate.description")}>
          <ui.Switch
            label={ctx.t("alternate.title")}
            hideLabel
            checked={settings().alternate}
            onChange={(value) => set("alternate", value)}
          />
        </ui.SettingsRow>
        <Show when={settings().alternate}>
          <ui.SettingsRow id="secondary" title={ctx.t("secondary.title")} description={ctx.t("secondary.description")}>
            <ColorInput
              label={ctx.t("secondary.title")}
              value={store.value.secondary ?? defaults.colors[1]}
              onInput={(value) => set("secondary", value)}
            />
          </ui.SettingsRow>
        </Show>
      </ui.SettingsSection>

      <ui.SettingsSection title={ctx.t("section.question")}>
        <ui.SettingsRow id="width" title={ctx.t("width.title")} description={ctx.t("width.description")}>
          <ui.Select
            label={ctx.t("width.title")}
            options={widths.map((value) => ({ value, label: widthLabel(value) }))}
            value={settings().width}
            onChange={(value) => set("width", value)}
          />
        </ui.SettingsRow>
        <ui.SettingsRow id="stripe" title={ctx.t("stripe.title")} description={ctx.t("stripe.description")}>
          <ui.Select
            label={ctx.t("stripe.title")}
            options={stripes.map((value) => ({ value, label: ctx.t(`stripe.${value}`) }))}
            value={settings().stripe}
            onChange={(value) => set("stripe", value)}
          />
        </ui.SettingsRow>
        <ui.SettingsRow id="tint" title={ctx.t("tint.title")} description={ctx.t("tint.description")}>
          <ui.Select
            label={ctx.t("tint.title")}
            options={tints.map((value) => ({ value, label: ctx.t(`tint.${value}`) }))}
            value={settings().tint}
            onChange={(value) => set("tint", value)}
          />
        </ui.SettingsRow>
      </ui.SettingsSection>

      <ui.SettingsSection title={ctx.t("section.text")}>
        <ui.SettingsRow id="textColor" title={ctx.t("textColor.title")} description={ctx.t("textColor.description")}>
          <ColorInput
            label={ctx.t("textColor.title")}
            value={store.value.textColor ?? ""}
            onInput={(value) => set("textColor", value)}
            placeholder={ctx.t("color.appDefault")}
          />
        </ui.SettingsRow>
        <ui.SettingsRow
          id="pendingTextColor"
          title={ctx.t("pendingTextColor.title")}
          description={ctx.t("pendingTextColor.description")}
        >
          <ColorInput
            label={ctx.t("pendingTextColor.title")}
            value={store.value.pendingTextColor ?? ""}
            onInput={(value) => set("pendingTextColor", value)}
            placeholder={ctx.t("color.appDefault")}
          />
        </ui.SettingsRow>
      </ui.SettingsSection>

      <ui.SettingsSection title={ctx.t("section.rail")}>
        <ui.SettingsRow id="rail" title={ctx.t("rail.title")} description={ctx.t("rail.description")}>
          <ui.Switch
            label={ctx.t("rail.title")}
            hideLabel
            checked={settings().rail}
            onChange={(value) => set("rail", value)}
          />
        </ui.SettingsRow>
        <Show when={settings().rail}>
          <ui.SettingsRow
            id="railStrength"
            title={ctx.t("railStrength.title")}
            description={ctx.t("railStrength.description")}
          >
            <ui.Select
              label={ctx.t("railStrength.title")}
              options={strengths.map((value) => ({ value, label: ctx.t(`railStrength.${value}`) }))}
              value={settings().railStrength}
              onChange={(value) => set("railStrength", value)}
            />
          </ui.SettingsRow>
        </Show>
      </ui.SettingsSection>
    </ui.SettingsLayout>
  )
}

// With a placeholder the field is optional: empty means "use the app's color" and isn't flagged as invalid.
function ColorInput(props: {
  label: string
  value: string
  onInput: (value: string) => void
  placeholder?: string
}): JSX.Element {
  const ui = usePlugin<typeof definition>().ui
  const empty = () => props.value.trim() === ""
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
      <span
        aria-hidden="true"
        style={{
          width: "20px",
          height: "20px",
          "border-radius": "4px",
          "flex-shrink": "0",
          border: `1px ${empty() ? "dashed" : "solid"} var(--v2-border-border-base)`,
          background: isColor(props.value) ? props.value : "transparent",
        }}
      />
      {/* Settings rows stretch inputs to their container, so this sets the input's width. */}
      <div style={{ width: "120px" }}>
        <ui.TextInput
          label={props.label}
          value={props.value}
          onInput={props.onInput}
          invalid={!(isColor(props.value) || (empty() && props.placeholder !== undefined))}
          placeholder={props.placeholder ?? "#9d7cd8"}
        />
      </div>
    </div>
  )
}
