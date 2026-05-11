'use client'

import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type Unsubscribe = () => void

interface SubscribeOptions {
  channelName: string
}

class RealtimeManager {
  private readonly channels = new Map<string, RealtimeChannel>()
  private readonly dedupe = new Set<string>()
  private readonly supabase = createClient()

  subscribe(
    options: SubscribeOptions,
    configure: (channel: RealtimeChannel) => RealtimeChannel
  ): Unsubscribe {
    const existing = this.channels.get(options.channelName)
    const channel = existing ?? configure(this.supabase.channel(options.channelName))

    if (!existing) {
      channel.subscribe()
      this.channels.set(options.channelName, channel)
    }

    return () => {
      const active = this.channels.get(options.channelName)
      if (!active) {
        return
      }

      this.supabase.removeChannel(active)
      this.channels.delete(options.channelName)
    }
  }

  shouldProcess(eventId: string) {
    if (this.dedupe.has(eventId)) {
      return false
    }

    this.dedupe.add(eventId)

    if (this.dedupe.size > 500) {
      const [first] = this.dedupe
      if (first) {
        this.dedupe.delete(first)
      }
    }

    return true
  }
}

let manager: RealtimeManager | null = null

export function getRealtimeManager() {
  if (!manager) {
    manager = new RealtimeManager()
  }

  return manager
}
