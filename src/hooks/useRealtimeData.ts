import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

interface Filter {
  column: string
  value: any
}

export function useRealtimeData<T = any>(
  table: string,
  select = "*",
  filter?: Filter
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

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
        if (isMounted) setData(data as T[] || [])
      }
      if (isMounted) setLoading(false)
    }

    fetchData()

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          if (!isMounted) return

          // Only handle relevant rows if filter is active
          if (filter && payload.new && payload.new[filter.column] !== filter.value) {
            return
          }

          if (payload.eventType === "INSERT") {
            setData((prev) => [...prev, payload.new as T])
          }
          if (payload.eventType === "UPDATE") {
            setData((prev) =>
              prev.map((item: any) =>
                item.id === payload.new.id ? (payload.new as T) : item
              )
            )
          }
          if (payload.eventType === "DELETE") {
            setData((prev) =>
              prev.filter((item: any) => item.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [table, select, filter?.column, filter?.value])

  return { data, loading, error }
}