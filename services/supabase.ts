import { createClient } from "@supabase/supabase-js";
import { isMockMode } from "./mock-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

// Criar cliente Supabase apenas se não estiver em modo mock
export const supabase = isMockMode()
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

// Métodos genéricos para CRUD
export const db = {
  // SELECT
  async select<T>(
    table: string,
    filters?: { column: string; value: any }[],
    orderBy?: { column: string; ascending?: boolean }
  ): Promise<T[]> {
    if (!supabase) {
      throw new Error("Supabase não configurado. Configure as variáveis de ambiente.");
    }
    let query = supabase.from(table).select("*");

    if (filters) {
      filters.forEach((filter) => {
        query = query.eq(filter.column, filter.value);
      });
    }

    if (orderBy) {
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending ?? true,
      });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  },

  // INSERT
  async insert<T>(table: string, data: Partial<T> | Partial<T>[]): Promise<T[]> {
    if (!supabase) {
      throw new Error("Supabase não configurado. Configure as variáveis de ambiente.");
    }
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) throw error;
    return result as T[];
  },

  // UPDATE
  async update<T>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    if (!supabase) {
      throw new Error("Supabase não configurado. Configure as variáveis de ambiente.");
    }
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  },

  // DELETE
  async delete(table: string, id: string | number): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase não configurado. Configure as variáveis de ambiente.");
    }
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
  },
};

