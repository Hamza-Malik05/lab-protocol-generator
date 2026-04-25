// Mock async data engine for Fulcrum LabGen.
// Swap the body of fetchLabData for httpx/aiohttp/fetch calls when the backend is ready.

export type QcResponse = {
  status: "success";
  data: {
    novelty_signal: string;
    references: { title: string; url: string; source: string }[];
  };
};

export type ProtocolStep = {
  step_number: number;
  title: string;
  description: string;
  duration_hours: number;
};

export type Material = {
  item_name: string;
  supplier: string;
  catalog_number: string;
  estimated_cost_usd: number;
};

export type PlanResponse = {
  status: "success";
  data: {
    executive_summary: string;
    protocol_steps: ProtocolStep[];
    materials_list: Material[];
    total_budget_usd: number;
    timeline_weeks: number;
    validation_approach: string;
  };
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchLabData(endpoint: "qc"): Promise<QcResponse>;
export async function fetchLabData(endpoint: "plan"): Promise<PlanResponse>;
export async function fetchLabData(
  endpoint: "qc" | "plan"
): Promise<QcResponse | PlanResponse> {
  await sleep(endpoint === "qc" ? 1400 : 1800);

  if (endpoint === "qc") {
    return {
      status: "success",
      data: {
        novelty_signal: "similar work exists",
        references: [
          {
            title: "Optimization of Lipid Nanoparticle Formulation for mRNA Delivery",
            url: "https://www.nature.com/nprot/example",
            source: "Nature Protocols",
          },
          {
            title: "Microfluidic Mixing Approaches to LNP Self-Assembly",
            url: "https://pubs.acs.org/example",
            source: "ACS Nano",
          },
          {
            title: "RiboGreen Quantification of Encapsulated RNA: A Practical Guide",
            url: "https://www.cell.com/example",
            source: "Cell Reports Methods",
          },
        ],
      },
    };
  }

  return {
    status: "success",
    data: {
      executive_summary:
        "This experiment aims to validate a reproducible lipid nanoparticle (LNP) formulation pipeline targeting >80% mRNA encapsulation efficiency, while minimizing polydispersity and batch-to-batch variation.",
      protocol_steps: [
        {
          step_number: 1,
          title: "Reagent Preparation",
          description:
            "Thaw lipids at room temperature for 30 minutes. Prepare ethanol lipid stock at 10 mg/mL ratio (ionizable:DSPC:Cholesterol:PEG = 50:10:38.5:1.5).",
          duration_hours: 2,
        },
        {
          step_number: 2,
          title: "Microfluidic Mixing",
          description:
            "Load aqueous mRNA phase (citrate buffer, pH 4.0) and ethanol lipid phase into the NanoAssemblr cartridge. Run at 12 mL/min total flow rate, 3:1 aqueous:organic ratio.",
          duration_hours: 3,
        },
        {
          step_number: 3,
          title: "Buffer Exchange & Concentration",
          description:
            "Perform tangential flow filtration against PBS pH 7.4 using 100 kDa MWCO membrane. Concentrate to target ~1 mg/mL mRNA.",
          duration_hours: 4,
        },
        {
          step_number: 4,
          title: "Characterization",
          description:
            "Measure particle size and PDI via DLS. Quantify encapsulation efficiency via RiboGreen assay (Triton X-100 vs untreated control).",
          duration_hours: 3,
        },
        {
          step_number: 5,
          title: "In Vitro Potency",
          description:
            "Transfect HepG2 cells at 100 ng/well. Read luciferase expression at 24h. Compare to MC3 reference LNP control.",
          duration_hours: 26,
        },
      ],
      materials_list: [
        { item_name: "Cholesterol", supplier: "Sigma-Aldrich", catalog_number: "C8667", estimated_cost_usd: 145.0 },
        { item_name: "DSPC", supplier: "Avanti Polar Lipids", catalog_number: "850365P", estimated_cost_usd: 320.0 },
        { item_name: "DMG-PEG2000", supplier: "Avanti Polar Lipids", catalog_number: "880151P", estimated_cost_usd: 410.0 },
        { item_name: "Ionizable Lipid (SM-102)", supplier: "MedChemExpress", catalog_number: "HY-134541", estimated_cost_usd: 285.0 },
        { item_name: "Quant-iT RiboGreen Kit", supplier: "Thermo Fisher", catalog_number: "R11490", estimated_cost_usd: 90.0 },
      ],
      total_budget_usd: 1250.0,
      timeline_weeks: 4,
      validation_approach:
        "Success will be measured by a minimum 80% encapsulation efficiency via RiboGreen assay, particle size of 70–110 nm with PDI < 0.2, and >2× luciferase signal over MC3 reference.",
    },
  };
}
