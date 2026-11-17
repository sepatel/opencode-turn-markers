// Marks each question and how far its answer runs in the session timeline (dark scheme only).
//
// The timeline is virtualized: every row is its own absolutely positioned, clipped box, tagged with
// data-timeline-row (UserMessage, AssistantPart, ...) and data-message-id (the message that started the
// exchange). The app ships two timeline renderers and only one marks rows data-timeline="next", so don't
// rely on it. Everything is drawn inside a row with padding, not margins, so the virtualizer still
// measures rows correctly.
//
// CSS can't count exchanges, since rows outside the viewport aren't in the DOM. The script numbers them
// from the sessions' message lists and tags each row data-turn-parity="even" | "odd" for the rail color.
;(function () {
  var css = [
    // Question bubble: a fixed 70% of the column (the app shrinks it to its text), still right-aligned.
    ':root[data-color-scheme="dark"] [data-component="user-message"] [data-slot="user-message-body"] {',
    '  width: 70% !important;',
    '  max-width: none !important;',
    '}',
    ':root[data-color-scheme="dark"] [data-component="user-message"] [data-slot="user-message-text"] {',
    '  display: block !important;',
    '  width: 100% !important;',
    '  box-sizing: border-box !important;',
    '}',

    // Tint and right-edge stripe follow the exchange's rail color. Queued (pending) messages keep the app's muted look.
    ':root[data-color-scheme="dark"] [data-component="user-message"]:not([data-pending]) [data-slot="user-message-text"] {',
    '  --user-message-bubble: #221a30 !important;',
    '  background: #221a30 !important;',
    '  box-shadow: inset -3px 0 0 #9d7cd8 !important;',
    '}',
    ':root[data-color-scheme="dark"] [data-turn-parity="odd"] [data-component="user-message"]:not([data-pending]) [data-slot="user-message-text"] {',
    '  --user-message-bubble: #2a1f17 !important;',
    '  background: #2a1f17 !important;',
    '  box-shadow: inset -3px 0 0 #fab283 !important;',
    '}',

    // Rail down the left of every row in an exchange; rows are contiguous, so it reads as one line.
    // Purple until a row is tagged, then purple and orange alternate per exchange.
    ':root[data-color-scheme="dark"] [data-timeline-row][data-message-id] {',
    '  box-shadow: inset 2px 0 0 rgba(157, 124, 216, 0.45) !important;',
    '  padding-inline-start: 14px !important;',
    '}',
    ':root[data-color-scheme="dark"] [data-timeline-row][data-message-id][data-turn-parity="odd"] {',
    '  box-shadow: inset 2px 0 0 rgba(250, 178, 131, 0.45) !important;',
    '}',
  ].join('\n')

  // Message types that start an exchange in the timeline.
  var starters = { user: true, shell: true }

  var sdk = require('@opencode/plugin/gui')
  var plugin = sdk.Plugin.define({
    setup: function (ctx) {
      ctx.add(sdk.Style, css)

      // Per session: the message list it was built from, its length then, and message id -> exchange number.
      var cache = new Map()

      function exchangeNumbers(ref) {
        var data = ref.server && ref.server.data
        if (!data) return undefined
        var list = data.session.message.list(ref.id)
        var hit = cache.get(ref.key)
        if (hit && hit.list === list && hit.length === list.length) return hit.numbers
        var ids = []
        list.forEach(function (message) {
          if (starters[message.type]) ids.push(message.id)
        })
        ids.sort()
        var numbers = new Map()
        ids.forEach(function (id, n) {
          numbers.set(id, n)
        })
        cache.set(ref.key, { list: list, length: list.length, numbers: numbers })
        return numbers
      }

      // Covers every open tab, since inactive tabs keep their timelines mounted.
      function lookup() {
        var maps = []
        ctx.sessions.list().forEach(function (ref) {
          try {
            var numbers = exchangeNumbers(ref)
            if (numbers) maps.push(numbers)
          } catch (error) {
            // A session whose messages aren't synced yet stays untagged and keeps the default rail.
          }
        })
        return function (id) {
          for (var i = 0; i < maps.length; i++) {
            var n = maps[i].get(id)
            if (n !== undefined) return n
          }
          return undefined
        }
      }

      var frame = 0

      function tag() {
        frame = 0
        var numberOf = lookup()
        document.querySelectorAll('[data-timeline-row][data-message-id]').forEach(function (row) {
          var n = numberOf(row.getAttribute('data-message-id'))
          if (n === undefined) {
            row.removeAttribute('data-turn-parity')
            return
          }
          var parity = n % 2 ? 'odd' : 'even'
          if (row.getAttribute('data-turn-parity') !== parity) row.setAttribute('data-turn-parity', parity)
        })
      }

      function schedule() {
        if (!frame) frame = requestAnimationFrame(tag)
      }

      var observer = new MutationObserver(schedule)
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-message-id'],
      })
      schedule()

      return function () {
        observer.disconnect()
        if (frame) cancelAnimationFrame(frame)
        document.querySelectorAll('[data-turn-parity]').forEach(function (row) {
          row.removeAttribute('data-turn-parity')
        })
      }
    },
  })
  plugin.default = plugin
  module.exports = plugin
})()
