import { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

interface InsertAuditLogInput {
  action: string
  actor_id?: string | null
  entity: string
  entity_id: string
  metadata?: Record<string, unknown>
}

function isMissingAuditInfrastructureError(error: { code?: string; message?: string } | null) {
  return error?.code === 'PGRST205' || error?.code === '42P01'
}

export async function insertAuditLog(
  supabase: SupabaseServerClient,
  input: InsertAuditLogInput
) {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      actor_id: input.actor_id ?? null,
      action: input.action,
      entity: input.entity,
      entity_id: input.entity_id,
      metadata: input.metadata ?? {},
    })
    .select()
    .maybeSingle()

  if (error) {
    if (isMissingAuditInfrastructureError(error)) {
      console.warn('Audit log skipped because audit_logs is not available in the current schema:', error.message)
      return null
    }

    throw error
  }

  return data ?? null
}
