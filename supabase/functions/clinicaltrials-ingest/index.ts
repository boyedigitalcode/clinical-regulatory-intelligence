import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const API_URL =
  "https://clinicaltrials.gov/api/v2/studies?pageSize=100";

async function generateLLMInsight(change: any) {
  if (!OPENAI_API_KEY) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a senior biotech competitive intelligence analyst producing executive-ready insights."
        },
        {
          role: "user",
          content: `
A clinical trial update has occurred.

NCT ID: ${change.nct_id}
Sponsor: ${change.sponsor}
Field Changed: ${change.field_changed}
Old Value: ${change.old_value}
New Value: ${change.new_value}

Provide:
1. Executive summary (max 3 sentences)
2. Strategic implication
3. Risk level (Low / Medium / High)

Respond in this JSON format only:
{
  "summary": "...",
  "strategic_implication": "...",
  "risk_level": "Low/Medium/High"
}
`
        }
      ]
    })
  });

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;

  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

serve(async () => {
  try {
    const response = await fetch(API_URL);
    const payload = await response.json();
    const studies = payload.studies ?? [];

    let processed = 0;
    let changes_logged = 0;
    let llm_generated = 0;

    for (const study of studies) {
      const protocol = study.protocolSection;
      if (!protocol) continue;

      const nct_id = protocol.identificationModule?.nctId;
      if (!nct_id) continue;

      const newRecord = {
        nct_id,
        official_title: protocol.identificationModule?.officialTitle ?? null,
        brief_title: protocol.identificationModule?.briefTitle ?? null,
        sponsor:
          protocol.sponsorCollaboratorsModule?.leadSponsor?.name ?? null,
        phase: protocol.designModule?.phases?.[0] ?? null,
        overall_status: protocol.statusModule?.overallStatus ?? null,
        conditions: protocol.conditionsModule?.conditions ?? null,
        interventions:
          protocol.armsInterventionsModule?.interventions?.map(
            (i: any) => i.name
          ) ?? null,
        enrollment:
          protocol.designModule?.enrollmentInfo?.count ?? null,
        start_date:
          protocol.statusModule?.startDateStruct?.date ?? null,
        primary_completion_date:
          protocol.statusModule?.primaryCompletionDateStruct?.date ?? null,
        locations:
          protocol.contactsLocationsModule?.locations ?? null,
        last_update_posted:
          protocol.statusModule?.lastUpdatePostDateStruct?.date ?? null,
        raw_payload: study
      };

      const { data: existing } = await supabase
        .from("clinical_trials_raw")
        .select("*")
        .eq("nct_id", nct_id)
        .maybeSingle();

      const fieldsToCheck = [
        "overall_status",
        "phase",
        "enrollment",
        "primary_completion_date",
        "sponsor"
      ];

      if (existing) {
        for (const field of fieldsToCheck) {
          const oldVal = (existing as any)[field];
          const newVal = (newRecord as any)[field];

          if (oldVal !== null && newVal !== null && oldVal !== newVal) {
            await supabase.from("clinical_trials_changes").insert({
              nct_id,
              field_changed: field,
              old_value: String(oldVal),
              new_value: String(newVal)
            });

            changes_logged++;

            const insight = await generateLLMInsight({
              nct_id,
              sponsor: newRecord.sponsor,
              field_changed: field,
              old_value: oldVal,
              new_value: newVal
            });

            if (insight) {
              await supabase.from("agent2_llm_insights").insert({
                nct_id,
                sponsor: newRecord.sponsor,
                signal_type: field,
                raw_change: {
                  field,
                  old_value: oldVal,
                  new_value: newVal
                },
                llm_summary: insight.summary,
                strategic_implication: insight.strategic_implication,
                risk_level: insight.risk_level
              });

              llm_generated++;
            }
          }
        }
      }

      await supabase.from("clinical_trials_raw").upsert(newRecord);
      processed++;
    }

    return new Response(
      JSON.stringify({
        processed,
        changes_logged,
        llm_generated
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Ingestion failed",
        details: String(error)
      }),
      { status: 500 }
    );
  }
});
