/**
 * Error Management State Machine
 *
 * Handles global error state for the application
 */

import { assign, type StateFrom, setup } from 'xstate'

// Error types
export interface AppError {
  id: string
  type: 'network' | 'validation' | 'cart' | 'checkout' | 'general' | 'auth'
  message: string
  details?: string
  timestamp: number
  recoverable?: boolean
  code?: string
  action?: {
    label: string
    handler: () => void
  }
}

interface ErrorMachineContext {
  errors: AppError[]
  globalError: AppError | null
  isOnline: boolean
}

type ErrorMachineEvent =
  | { type: 'ADD_ERROR'; payload: Omit<AppError, 'id' | 'timestamp'> }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_GLOBAL_ERROR'; payload: AppError | null }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }

export const errorMachine: ReturnType<typeof setup> = setup({
  types: {
    context: {} as ErrorMachineContext,
    events: {} as ErrorMachineEvent,
  },
}).createMachine({
  id: 'errorManagement',
  initial: 'active',
  context: {
    errors: [],
    globalError: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  },
  states: {
    active: {
      on: {
        ADD_ERROR: {
          actions: assign({
            errors: ({ context, event }) => {
              const newError: AppError = {
                ...event.payload,
                id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
              }
              return [...context.errors, newError]
            },
          }),
        },
        REMOVE_ERROR: {
          actions: assign({
            errors: ({ context, event }) =>
              context.errors.filter((error) => error.id !== event.payload),
          }),
        },
        CLEAR_ERRORS: {
          actions: assign({
            errors: [],
          }),
        },
        SET_GLOBAL_ERROR: {
          actions: assign({
            globalError: ({ event }) => event.payload,
          }),
        },
        SET_ONLINE_STATUS: {
          actions: assign({
            isOnline: ({ event }) => event.payload,
          }),
        },
      },
    },
  },
})

// Selectors
type ErrorMachineState = StateFrom<typeof errorMachine>

export const getErrors = (state: ErrorMachineState | undefined): AppError[] => state?.context?.errors || []

export const getGlobalError = (state: ErrorMachineState | undefined): AppError | null =>
  state?.context?.globalError || null

export const getIsOnline = (state: ErrorMachineState | undefined): boolean =>
  state?.context?.isOnline ?? true

// Utility functions for creating errors
export const createNetworkError = (
  message: string,
  details?: string
): Omit<AppError, 'id' | 'timestamp'> => ({
  type: 'network',
  message,
  details,
  recoverable: true,
})

export const createValidationError = (
  message: string,
  details?: string
): Omit<AppError, 'id' | 'timestamp'> => ({
  type: 'validation',
  message,
  details,
  recoverable: true,
})

export const createCartError = (
  message: string,
  details?: string
): Omit<AppError, 'id' | 'timestamp'> => ({
  type: 'cart',
  message,
  details,
  recoverable: true,
})

export const createCheckoutError = (
  message: string,
  details?: string
): Omit<AppError, 'id' | 'timestamp'> => ({
  type: 'checkout',
  message,
  details,
  recoverable: false,
})

export const createGeneralError = (
  message: string,
  details?: string
): Omit<AppError, 'id' | 'timestamp'> => ({
  type: 'general',
  message,
  details,
  recoverable: false,
})
