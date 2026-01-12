import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[IMPORT-TRANSACTIONS] ${step}${detailsStr}`);
};

// Security constants - must match client-side validation
const MAX_TRANSACTIONS_PER_IMPORT = 1000;
const MAX_AMOUNT = 999999999.99;
const MAX_NOTE_LENGTH = 500;
const MAX_CATEGORY_LENGTH = 100;
const VALID_TRANSACTION_TYPES = ['income', 'expense', 'savings'];
const MIN_DATE = new Date('2000-01-01');
const MAX_DATE_YEARS_AHEAD = 1;

// Sanitize text to prevent XSS and formula injection
function sanitizeText(text: string | null | undefined, maxLength: number): string | null {
  if (!text || typeof text !== 'string') return null;
  
  // Remove potential formula injection characters at start
  let sanitized = text.trim();
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r', '\n'];
  while (sanitized.length > 0 && dangerousChars.includes(sanitized[0])) {
    sanitized = sanitized.substring(1).trim();
  }
  
  // Remove HTML tags and scripts
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Limit length
  return sanitized.substring(0, maxLength) || null;
}

// Validate and parse date
function validateDate(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + MAX_DATE_YEARS_AHEAD);
  
  if (date < MIN_DATE || date > maxDate) return null;
  
  return date.toISOString().split('T')[0];
}

// Validate transaction type
function validateTransactionType(type: string): string | null {
  if (!type || typeof type !== 'string') return null;
  const normalized = type.toLowerCase().trim();
  return VALID_TRANSACTION_TYPES.includes(normalized) ? normalized : null;
}

// Validate amount
function validateAmount(amount: number): number | null {
  if (typeof amount !== 'number' || isNaN(amount)) return null;
  const absAmount = Math.abs(amount);
  if (absAmount <= 0 || absAmount > MAX_AMOUNT) return null;
  return Math.round(absAmount * 100) / 100; // Round to 2 decimal places
}

interface TransactionInput {
  type: string;
  amount: number;
  transaction_date: string;
  category?: string | null;
  note?: string | null;
}

interface ValidatedTransaction {
  project_id: string;
  type: string;
  amount: number;
  transaction_date: string;
  category: string | null;
  note: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: { persistSession: false },
      }
    );

    // Verify user is authenticated
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) {
      logStep("Authentication failed", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Authentication failed" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Parse request body
    let body: { projectId: string; transactions: TransactionInput[] };
    try {
      body = await req.json();
    } catch {
      logStep("Invalid JSON body");
      return new Response(
        JSON.stringify({ error: "Invalid request body" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { projectId, transactions } = body;

    // Validate projectId
    if (!projectId || typeof projectId !== 'string') {
      logStep("Missing projectId");
      return new Response(
        JSON.stringify({ error: "Missing projectId" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate transactions array
    if (!Array.isArray(transactions)) {
      logStep("Transactions must be an array");
      return new Response(
        JSON.stringify({ error: "Transactions must be an array" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: max transactions per import
    if (transactions.length > MAX_TRANSACTIONS_PER_IMPORT) {
      logStep("Too many transactions", { count: transactions.length, max: MAX_TRANSACTIONS_PER_IMPORT });
      return new Response(
        JSON.stringify({ error: `Maximum ${MAX_TRANSACTIONS_PER_IMPORT} transactions per import` }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (transactions.length === 0) {
      logStep("No transactions provided");
      return new Response(
        JSON.stringify({ error: "No transactions provided" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user owns the project (RLS will enforce this, but double-check)
    const { data: project, error: projectError } = await supabaseClient
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      logStep("Project not found or access denied", { projectId, error: projectError?.message });
      return new Response(
        JSON.stringify({ error: "Project not found or access denied" }), 
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Additional ownership check (defense in depth beyond RLS)
    if (project.user_id !== userId) {
      logStep("User does not own project", { projectId, projectOwner: project.user_id, userId });
      return new Response(
        JSON.stringify({ error: "Access denied" }), 
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Project ownership verified", { projectId });

    // Validate and sanitize each transaction
    const validatedTransactions: ValidatedTransaction[] = [];
    const validationErrors: string[] = [];

    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      
      // Validate type
      const type = validateTransactionType(t.type);
      if (!type) {
        validationErrors.push(`Row ${i + 1}: Invalid transaction type`);
        continue;
      }

      // Validate amount
      const amount = validateAmount(t.amount);
      if (amount === null) {
        validationErrors.push(`Row ${i + 1}: Invalid amount`);
        continue;
      }

      // Validate date
      const transactionDate = validateDate(t.transaction_date);
      if (!transactionDate) {
        validationErrors.push(`Row ${i + 1}: Invalid date`);
        continue;
      }

      // Sanitize text fields
      const category = sanitizeText(t.category, MAX_CATEGORY_LENGTH);
      const note = sanitizeText(t.note, MAX_NOTE_LENGTH);

      validatedTransactions.push({
        project_id: projectId,
        type,
        amount,
        transaction_date: transactionDate,
        category,
        note,
      });
    }

    if (validatedTransactions.length === 0) {
      logStep("No valid transactions after validation", { errorCount: validationErrors.length });
      return new Response(
        JSON.stringify({ 
          error: "No valid transactions to import",
          validationErrors: validationErrors.slice(0, 10) // Return first 10 errors
        }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Transactions validated", { 
      valid: validatedTransactions.length, 
      invalid: validationErrors.length 
    });

    // Insert transactions in batches to avoid timeouts
    const BATCH_SIZE = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < validatedTransactions.length; i += BATCH_SIZE) {
      const batch = validatedTransactions.slice(i, i + BATCH_SIZE);
      
      const { error: insertError } = await supabaseClient
        .from("transactions")
        .insert(batch);

      if (insertError) {
        logStep("Insert error", { batchIndex: i, error: insertError.message });
        return new Response(
          JSON.stringify({ 
            error: "Failed to import transactions",
            inserted: insertedCount,
            details: insertError.message
          }), 
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      insertedCount += batch.length;
    }

    logStep("Import completed", { 
      inserted: insertedCount, 
      skipped: validationErrors.length 
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        inserted: insertedCount,
        skipped: validationErrors.length,
        validationErrors: validationErrors.length > 0 ? validationErrors.slice(0, 5) : undefined
      }), 
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Unhandled error", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: "Server error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
