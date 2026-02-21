/**
 * Dark Mode Toggle State Machine (XState v5)
 *
 * Manages dark mode state and system preference
 */

import { type ActorRefFrom, assign, type StateFrom, setup } from 'xstate'

interface DarkModeContext {
  isDark: boolean
  systemPreference: boolean
}

type DarkModeEvent =
  | { type: 'TOGGLE' }
  | { type: 'SET_DARK'; value: boolean }
  | { type: 'SYSTEM_CHANGED'; value: boolean }

export const darkModeMachine: ReturnType<typeof setup> = setup({
  types: {
    context: {} as DarkModeContext,
    events: {} as DarkModeEvent,
    input: {} as {
      isDark?: boolean
      systemPreference?: boolean
    },
  },

  actions: {
    toggleDarkMode: assign({
      isDark: ({ context }) => !context.isDark,
    }),

    setDarkMode: assign(({ context, event }) => {
      if (event.type !== 'SET_DARK') {
        return context
      }
      return {
        ...context,
        isDark: event.value,
      }
    }),

    updateSystemPreference: assign(({ context, event }) => {
      if (event.type !== 'SYSTEM_CHANGED') {
        return context
      }
      return {
        ...context,
        systemPreference: event.value,
      }
    }),
  },
}).createMachine({
  id: 'darkMode',
  initial: 'idle',
  context: ({ input }) => ({
    isDark: input?.isDark || false,
    systemPreference: input?.systemPreference || false,
  }),
  states: {
    idle: {
      on: {
        TOGGLE: {
          actions: 'toggleDarkMode',
        },
        SET_DARK: {
          actions: 'setDarkMode',
        },
        SYSTEM_CHANGED: {
          actions: 'updateSystemPreference',
        },
      },
    },
  },
})

// Type helpers
export type DarkModeMachineSnapshot = StateFrom<typeof darkModeMachine>
export type DarkModeMachineActor = ActorRefFrom<typeof darkModeMachine>
