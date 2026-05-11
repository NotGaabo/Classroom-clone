'use client'

export interface QueuedAction<TPayload = Record<string, unknown>> {
  clientActionId: string
  createdAt: string
  lastAttemptAt: string | null
  payload: TPayload
  retryCount: number
  type: 'comment' | 'draft-submission' | 'notification-read'
}

const STORAGE_KEY = 'classroom-offline-queue'

function readQueue() {
  if (typeof window === 'undefined') {
    return [] as QueuedAction[]
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as QueuedAction[]) : []
  } catch {
    return []
  }
}

function writeQueue(queue: QueuedAction[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
}

export function enqueueOfflineAction(action: Omit<QueuedAction, 'clientActionId' | 'createdAt' | 'lastAttemptAt' | 'retryCount'>) {
  const queue = readQueue()

  queue.push({
    ...action,
    clientActionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lastAttemptAt: null,
    retryCount: 0,
  })

  writeQueue(queue)
}

export function getQueuedActions() {
  return readQueue()
}

export function updateQueuedAction(actionId: string, updater: (action: QueuedAction) => QueuedAction) {
  const nextQueue = readQueue().map((action) => (action.clientActionId === actionId ? updater(action) : action))
  writeQueue(nextQueue)
}

export function removeQueuedAction(actionId: string) {
  writeQueue(readQueue().filter((action) => action.clientActionId !== actionId))
}
