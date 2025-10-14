import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

interface Filter {
  column: string
  value: string | number | boolean
}

type ChangePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: unknown
  old?: unknown
}

export function useRealtimeData<T = unknown>(
  table: string,
  select = "*",
  filter?: Filter
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      let query = supabase.from(table).select(select)

      if (filter) {
        query = query.eq(filter.column, filter.value)
      }

      const { data, error } = await query
      if (error) {
        if (isMounted) setError(error)
      } else {
        const rows = Array.isArray(data) ? (data as unknown as T[]) : []
        if (isMounted) setData(rows)
      }
      if (isMounted) setLoading(false)
    }

    fetchData()

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: ChangePayload) => {
          if (!isMounted) return

          // Only handle relevant rows if filter is active
          if (
            filter &&
            payload.new &&
            typeof payload.new === 'object' &&
            (payload.new as Record<string, unknown>)[filter.column] !== filter.value
          ) {
            return
          }

          if (payload.eventType === "INSERT") {
            if (payload.new) {
              setData((prev) => [...prev, payload.new as T])
            }
          }
          if (payload.eventType === "UPDATE") {
            setData((prev) =>
              prev.map((item: T) => {
                const itemId = (item as { id?: unknown })?.id
                const newId = (payload.new as { id?: unknown })?.id
                return itemId !== undefined && itemId === newId ? (payload.new as T) : item
              })
            )
          }
          if (payload.eventType === "DELETE") {
            setData((prev) =>
              prev.filter((item: T) => {
                const itemId = (item as { id?: unknown })?.id
                const oldId = (payload.old as { id?: unknown })?.id
                return itemId === undefined || itemId !== oldId
              })
            )
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [table, select, filter, filter?.column, filter?.value])

  return { data, loading, error }
}