import { Plugin } from "@opencode/plugin"

// The GUI part in gui-experimental.cjs does the work; this lets the package resolve as a plugin.
export default Plugin.define({
  id: "turn-markers",
  async setup() {},
})
