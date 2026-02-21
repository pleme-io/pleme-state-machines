/**
 * Loading Management State Machine
 *
 * Handles global and operation-specific loading states
 */

import { assign, setup } from 'xstate'

interface LoadingMachineContext {
  globalLoading: boolean
  operations: Record<string, boolean>
  messages: Record<string, string>
}

type LoadingMachineEvent =
  | { type: 'START_GLOBAL_LOADING'; payload?: string }
  | { type: 'STOP_GLOBAL_LOADING' }
  | { type: 'START_OPERATION'; payload: { key: string; message?: string } }
  | { type: 'STOP_OPERATION'; payload: string }
  | { type: 'CLEAR_ALL_OPERATIONS' }

export const loadingMachine: ReturnType<typeof setup> = setup({
  types: {
    context: {} as LoadingMachineContext,
    events: {} as LoadingMachineEvent,
  },
}).createMachine({
  id: 'loadingManagement',
  initial: 'idle',
  context: {
    globalLoading: false,
    operations: {},
    messages: {},
  },
  states: {
    idle: {
      on: {
        START_GLOBAL_LOADING: {
          actions: assign({
            globalLoading: true,
            messages: ({ context, event }) => ({
              ...context.messages,
              global: event.payload || 'Carregando...',
            }),
          }),
        },
        STOP_GLOBAL_LOADING: {
          actions: assign({
            globalLoading: false,
            messages: ({ context }) => ({
              ...context.messages,
              global: '',
            }),
          }),
        },
        START_OPERATION: {
          actions: assign({
            operations: ({ context, event }) => ({
              ...context.operations,
              [event.payload.key]: true,
            }),
            messages: ({ context, event }) => ({
              ...context.messages,
              [event.payload.key]: event.payload.message || 'Carregando...',
            }),
          }),
        },
        STOP_OPERATION: {
          actions: assign({
            operations: ({ context, event }) => {
              const { [event.payload]: _, ...restOperations } = context.operations
              return restOperations
            },
            messages: ({ context, event }) => {
              const { [event.payload]: _, ...restMessages } = context.messages
              return restMessages
            },
          }),
        },
        CLEAR_ALL_OPERATIONS: {
          actions: assign({
            operations: {},
            messages: {},
          }),
        },
      },
    },
  },
})

// Selectors
export const getGlobalLoading = (state: ReturnType<typeof loadingMachine.getInitialSnapshot>): boolean =>
  state.context.globalLoading

export const getOperations = (state: ReturnType<typeof loadingMachine.getInitialSnapshot>): Record<string, boolean> =>
  state.context.operations

export const getMessages = (state: ReturnType<typeof loadingMachine.getInitialSnapshot>): Record<string, string> =>
  state.context.messages

export const isLoading = (
  state: ReturnType<typeof loadingMachine.getInitialSnapshot>,
  key?: string
): boolean => {
  if (key) {
    return !!state.context.operations[key]
  }
  return state.context.globalLoading || Object.keys(state.context.operations).length > 0
}

export const getLoadingMessage = (
  state: ReturnType<typeof loadingMachine.getInitialSnapshot>,
  key?: string
): string => {
  if (key) {
    return state.context.messages[key] || ''
  }
  if (state.context.globalLoading) {
    return state.context.messages.global || 'Carregando...'
  }
  const activeOperations = Object.keys(state.context.operations)
  if (activeOperations.length > 0) {
    return state.context.messages[activeOperations[0]] || 'Carregando...'
  }
  return ''
}
