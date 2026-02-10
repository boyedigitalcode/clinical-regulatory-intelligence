import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLINICALTRIALS_API =
  "https://clinicaltrials.gov/api/v2/studies?pageSize=100";

serve(async () => {
  try {
    const response = await fetch(CLINICALTRIALS_API);
    const data = await response.json();

    return new Response(JSON.stringify({
      message: "ClinicalTrials ingestion successful",
      study_count: data.studies?.length ?? 0
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to ingest ClinicalTrials data",
      details: String(error)
    }), { status: 500 });
  }
});
