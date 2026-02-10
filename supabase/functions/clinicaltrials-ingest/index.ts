import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const API_URL =
  "https://clinicaltrials.gov/api/v2/studies?pageSize=100";

serve(async () => {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();

    const studies = json.studies ?? [];

    for (const study of studies) {
      const protocol = study.protocolSection ?? {};
      const id = protocol.identificationModule?.nctId;

      if (!id) continue;

      await supabase.from("clinical_trials_raw").upsert({
        nct_id: id,
        official_title: protocol.identificationModule?.officialTitle,
        brief_title: protocol.identificationModule?.briefTitle,
        sponsor: protocol.sponsorCollaboratorsModule?.leadSponsor?.name,
        phase: protocol.designModule?.phases?.[0],
        overall_status: protocol.statusModule?.overallStatus,
        conditions: protocol.conditionsModule?.conditions,
        interventions:
          protocol.armsInterventionsModule?.interventions?.map(
            (i: any) => i.name
          ),
        enrollment:
          protocol.designModule?.enrollmentInfo?.count,
        start_date:
          protocol.statusModule?.startDateStruct?.date,
        primary_completion_date:
          protocol.statusModule?.primaryCompletionDateStruct?.date,
        locations:
          protocol.contactsLocationsModule?.locations,
        last_update_posted:
          protocol.statusModule?.lastUpdatePostDateStruct?.date,
        raw_payload: study
      });
    }

    return new Response(
      JSON.stringify({ inserted: studies.length }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500 }
    );
  }
});
