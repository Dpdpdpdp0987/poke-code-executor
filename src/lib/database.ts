import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface Execution {
  code: string;
  language: string;
  output: string;
  error: any;
  timestamp: Date;
}

export async function saveExecution(execution: Execution): Promise<string> {
  const { data, error } = await supabase
    .from('executions')
    .insert([
      {
        code: execution.code,
        language: execution.language,
        output: execution.output,
        error: execution.error ? JSON.stringify(execution.error) : null,
        created_at: execution.timestamp.toISOString()
      }
    ])
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save execution: ${error.message}`);
  }

  return data.id;
}

export async function getExecutionHistory(params: {
  page: number;
  limit: number;
  language?: string;
}) {
  const { page, limit, language } = params;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('executions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (language) {
    query = query.eq('language', language);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch execution history: ${error.message}`);
  }

  return {
    executions: data || [],
    page,
    limit,
    total: count || 0
  };
}

export async function getExecutionById(id: string) {
  const { data, error } = await supabase
    .from('executions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch execution: ${error.message}`);
  }

  return data;
}