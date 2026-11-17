import type { SessionRef } from "@opencode/plugin/gui"

// The timeline is virtualized: rows outside the viewport aren't in the DOM, so CSS can't count exchanges.
// Each row carries data-message-id, the message that started its exchange. This numbers those messages from
// each open session's message list and tags rows with data-turn-color, cycling through the palette.

const attribute = "data-turn-color"
const rowSelector = "[data-timeline-row][data-message-id]"
// Message types that start an exchange in the timeline.
const starters = new Set(["user", "shell"])

interface Cached {
  list: readonly { id: string; type: string }[]
  length: number
  numbers: Map<string, number>
}

export interface TagStats {
  rows: number
  tagged: number
  sessions: number
}

export function createTagger(input: { sessions: () => readonly SessionRef[]; colors: () => number }) {
  const cache = new Map<string, Cached>()
  let frame = 0
  let stats: TagStats = { rows: 0, tagged: 0, sessions: 0 }

  function exchangeNumbers(ref: SessionRef): Map<string, number> {
    const list = ref.server.data.session.message.list(ref.id)
    const hit = cache.get(ref.key)
    if (hit && hit.list === list && hit.length === list.length) return hit.numbers
    const ids = list.filter((message) => starters.has(message.type)).map((message) => message.id)
    // Message ids sort chronologically as strings.
    ids.sort()
    const numbers = new Map(ids.map((id, n) => [id, n]))
    cache.set(ref.key, { list, length: list.length, numbers })
    return numbers
  }

  function tag() {
    frame = 0
    const count = input.colors()
    const rows = document.querySelectorAll(rowSelector)
    if (count < 2) {
      rows.forEach((row) => row.removeAttribute(attribute))
      stats = { rows: rows.length, tagged: 0, sessions: 0 }
      return
    }

    const maps = input.sessions().flatMap((ref) => {
      try {
        return [exchangeNumbers(ref)]
      } catch {
        // A session whose messages aren't synced yet stays untagged and keeps the first color.
        return []
      }
    })
    let tagged = 0
    rows.forEach((row) => {
      const id = row.getAttribute("data-message-id") ?? ""
      const n = maps.map((numbers) => numbers.get(id)).find((value) => value !== undefined)
      if (n === undefined) {
        row.removeAttribute(attribute)
        return
      }
      tagged++
      const value = String(n % count)
      if (row.getAttribute(attribute) !== value) row.setAttribute(attribute, value)
    })
    stats = { rows: rows.length, tagged, sessions: maps.length }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(tag)
  }

  const observer = new MutationObserver(schedule)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-message-id"],
  })
  schedule()

  return {
    schedule,
    stats: () => stats,
    dispose() {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
      document.querySelectorAll(`[${attribute}]`).forEach((row) => row.removeAttribute(attribute))
    },
  }
}
