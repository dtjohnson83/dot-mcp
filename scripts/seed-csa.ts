/**
 * Seed CSA BASIC categories and violation codes
 * Source: FMCSA CSA Program (Safety Measurement System)
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const csaCategories = [
  {
    basic_code: "HOS",
    basic_name: "Hours of Service Compliance",
    description: "Measures violations related to driver hours of service, including electronic logging device (ELD) compliance, logbook violations, and HOS limit exceedances.",
    severity_ratings: [
      "Severity 7: HOS-driving time exceeded",
      "Severity 7: HOS-60/70 hour limit exceeded",
      "Severity 5: HOS-30 minute break violation",
      "Severity 8: Falsifying records of duty status",
      "Severity 6: ELD violation (unregistered device, editing records)"
    ],
    intervention_thresholds: [
      "Alert threshold: BASIC measure >= 65% of intervention threshold",
      "Priority intervention: BASIC measure >= 80% of intervention threshold",
      "Investigation threshold: BASIC measure >= 90% of intervention threshold"
    ],
    carrier_type: ["trucking", "passenger", "hazmat"],
    citation: "49 CFR Part 395; FMCSA CSA Program"
  },
  {
    basic_code: "DRF",
    basic_name: "Driver Fitness",
    description: "Measures violations related to driver qualifications, including medical certificates, licenses, and driver fitness requirements. Covers drivers who are not legally qualified to operate a commercial motor vehicle.",
    severity_ratings: [
      "Severity 8: Driver not qualified (no medical card, expired)",
      "Severity 7: False statement on qualification documents",
      "Severity 6: Driver under 21 years in interstate commerce",
      "Severity 5: Incomplete driver qualification file"
    ],
    intervention_thresholds: [
      "Alert threshold varies by carrier size and BASIC percentile",
      "Unqualified driver violations carry high severity weighting"
    ],
    carrier_type: ["trucking", "passenger"],
    citation: "49 CFR Part 391"
  },
  {
    basic_code: "BDD",
    basic_name: "Unsafe Driving",
    description: "Measures violations related to careless or dangerous driving behaviors, including speeding, reckless driving, improper lane changes, and traffic violations observed during roadside inspections.",
    severity_ratings: [
      "Severity 8: Reckless driving",
      "Severity 7: Excessive speeding (15+ mph over limit)",
      "Severity 6: Speeding 10-14 mph over limit",
      "Severity 5: Following too close, improper lane change",
      "Severity 3: Traffic control device violation"
    ],
    intervention_thresholds: [
      "Unsafe driving violations weighted heavily in CSA scoring",
      "High threshold for carriers with few inspections"
    ],
    carrier_type: ["trucking", "passenger"],
    citation: "49 CFR 392; FMCSA CSA Program"
  },
  {
    basic_code: "VEH",
    basic_name: "Vehicle Maintenance",
    description: "Measures violations related to vehicle mechanical fitness, including brakes, lights, tires, steering, and other critical safety components identified during roadside inspections.",
    severity_ratings: [
      "Severity 8: Inoperative brakes (out of service)",
      "Severity 7: Steering component failure",
      "Severity 6: Tire violation (bald, damaged)",
      "Severity 5: Lighting violations",
      "Severity 4: Windshield/wiper violations"
    ],
    intervention_thresholds: [
      "Out-of-service vehicle violations carry highest severity",
      "Brake-related violations are weighted most heavily in VEH BASIC"
    ],
    carrier_type: ["trucking", "passenger", "hazmat"],
    citation: "49 CFR Parts 393, 396; FMCSA CSA Program"
  },
  {
    basic_code: "MAC",
    basic_name: "Controlled Substances / Alcohol",
    description: "Measures violations related to drug and alcohol use by drivers, including positive drug tests, alcohol possession, and refusal to submit to testing.",
    severity_ratings: [
      "Severity 10: Driver under influence of alcohol/drugs",
      "Severity 10: Refusal to submit to drug/alcohol test",
      "Severity 8: Positive drug test result",
      "Severity 8: Alcohol possession in CMV"
    ],
    intervention_thresholds: [
      "Any MAC violation triggers immediate investigation",
      "Single violation can result in unfit determination"
    ],
    carrier_type: ["trucking", "passenger"],
    citation: "49 CFR Part 382; FMCSA CSA Program"
  },
  {
    basic_code: "SSR",
    basic_name: "Hazardous Materials Safety",
    description: "Measures violations related to the transportation of hazardous materials, including proper placarding, shipping papers, packaging, and training. Applies to carriers transporting reportable quantities.",
    severity_ratings: [
      "Severity 8: Hazmat packaging/containment failure",
      "Severity 8: Hazmat placarding violations",
      "Severity 7: Hazmat shipping paper violations",
      "Severity 6: Hazmat marking/labeling violations",
      "Severity 5: Incomplete hazmat training documentation"
    ],
    intervention_thresholds: [
      "Hazmat violations can result in out-of-service orders",
      "Imminent hazard determinations for severe violations"
    ],
    carrier_type: ["hazmat"],
    citation: "49 CFR Parts 100-185; FMCSA CSA Program"
  },
  {
    basic_code: "VEO",
    basic_name: "Vehicle Financial Responsibility",
    description: "Measures violations related to proof of insurance and financial responsibility. Carriers must maintain minimum required insurance coverage for the types of operations they conduct.",
    severity_ratings: [
      "Severity 8: Operating without required insurance/financial responsibility",
      "Severity 7: Failure to maintain proof of insurance documents"
    ],
    intervention_thresholds: [
      "VEO violations can trigger loss of operating authority",
      "Minimum coverage requirements vary by operation type"
    ],
    carrier_type: ["trucking", "passenger", "hazmat"],
    citation: "49 CFR Part 387"
  }
];

// Common FMCSA violation codes
const violationCodes = [
  // HOS Violations
  { violation_code: "395.3A", description: "Driver drove more than 11 hours", basic_area: "HOS", csa_category: "HOS", acute_indicator: false, critical_indicator: true, severity_weight: 7, citation: "49 CFR 395.3(a)(3)(i)", carrier_type: ["trucking", "passenger"] },
  { violation_code: "395.3B", description: "Driver drove after 14-hour window", basic_area: "HOS", csa_category: "HOS", acute_indicator: false, critical_indicator: true, severity_weight: 7, citation: "49 CFR 395.3(a)(2)", carrier_type: ["trucking", "passenger"] },
  { violation_code: "395.3C", description: "Driver did not take required 30-min break", basic_area: "HOS", csa_category: "HOS", acute_indicator: false, critical_indicator: false, severity_weight: 5, citation: "49 CFR 395.3(a)(3)(ii)", carrier_type: ["trucking"] },
  { violation_code: "395.3D", description: "Driver exceeded 60/70 hour limit", basic_area: "HOS", csa_category: "HOS", acute_indicator: false, critical_indicator: true, severity_weight: 7, citation: "49 CFR 395.3(b)", carrier_type: ["trucking"] },
  { violation_code: "395.8A", description: "False records of duty status", basic_area: "HOS", csa_category: "HOS", acute_indicator: true, critical_indicator: true, severity_weight: 8, citation: "49 CFR 395.8(e)", carrier_type: ["trucking"] },
  { violation_code: "395.8", description: "Failure to require driver to prepare log", basic_area: "HOS", csa_category: "HOS", acute_indicator: false, critical_indicator: false, severity_weight: 5, citation: "49 CFR 395.8", carrier_type: ["trucking"] },
  { violation_code: "395.11", description: "ELD data not available or not provided", basic_area: "HOS", csa_category: "HOS", acute_indicator: false, critical_indicator: false, severity_weight: 6, citation: "49 CFR 395.34", carrier_type: ["trucking"] },
  { violation_code: "395.24", description: "Driver failed to manually enter ELD info", basic_area: "HOS", csa_category: "HOS", acute_indicator: false, critical_indicator: false, severity_weight: 5, citation: "49 CFR 395.24", carrier_type: ["trucking"] },

  // Driver Fitness
  { violation_code: "391.11", description: "Driver not qualified", basic_area: "DRF", csa_category: "DRF", acute_indicator: false, critical_indicator: true, severity_weight: 8, citation: "49 CFR 391.11", carrier_type: ["trucking", "passenger"] },
  { violation_code: "391.15A", description: "Driver disqualified - alcohol/drugs", basic_area: "DRF", csa_category: "DRF", acute_indicator: true, critical_indicator: true, severity_weight: 10, citation: "49 CFR 391.15", carrier_type: ["trucking", "passenger"] },
  { violation_code: "391.41", description: "No medical certificate in possession", basic_area: "DRF", csa_category: "DRF", acute_indicator: false, critical_indicator: false, severity_weight: 6, citation: "49 CFR 391.41", carrier_type: ["trucking", "passenger"] },
  { violation_code: "391.45", description: "Driver not physically qualified", basic_area: "DRF", csa_category: "DRF", acute_indicator: false, critical_indicator: true, severity_weight: 8, citation: "49 CFR 391.45", carrier_type: ["trucking", "passenger"] },

  // Unsafe Driving
  { violation_code: "392.2", description: "State/local law violation", basic_area: "BDD", csa_category: "BDD", acute_indicator: false, critical_indicator: false, severity_weight: 4, citation: "49 CFR 392.2", carrier_type: ["trucking", "passenger"] },
  { violation_code: "392.4", description: "Driver using/possessing controlled substance", basic_area: "MAC", csa_category: "MAC", acute_indicator: true, critical_indicator: true, severity_weight: 10, citation: "49 CFR 392.4", carrier_type: ["trucking", "passenger"] },
  { violation_code: "392.5", description: "Driver under influence of alcohol", basic_area: "MAC", csa_category: "MAC", acute_indicator: true, critical_indicator: true, severity_weight: 10, citation: "49 CFR 392.5", carrier_type: ["trucking", "passenger"] },
  { violation_code: "392.16", description: "Failure to use seat belt", basic_area: "BDD", csa_category: "BDD", acute_indicator: false, critical_indicator: false, severity_weight: 4, citation: "49 CFR 392.16", carrier_type: ["trucking", "passenger"] },
  { violation_code: "392.71", description: "Using hand-held mobile telephone while driving", basic_area: "BDD", csa_category: "BDD", acute_indicator: false, critical_indicator: false, severity_weight: 6, citation: "49 CFR 392.82", carrier_type: ["trucking", "passenger"] },

  // Vehicle Maintenance
  { violation_code: "393.9", description: "Inoperative headlights/taillights", basic_area: "VEH", csa_category: "VEH", acute_indicator: false, critical_indicator: false, severity_weight: 4, citation: "49 CFR 393.9", carrier_type: ["trucking", "passenger"] },
  { violation_code: "393.40A", description: "Brake violation - out of service", basic_area: "VEH", csa_category: "VEH", acute_indicator: true, critical_indicator: true, severity_weight: 8, citation: "49 CFR 393.40", carrier_type: ["trucking", "passenger"] },
  { violation_code: "393.47", description: "Inadequate brakes", basic_area: "VEH", csa_category: "VEH", acute_indicator: false, critical_indicator: false, severity_weight: 6, citation: "49 CFR 393.47", carrier_type: ["trucking", "passenger"] },
  { violation_code: "393.55", description: "ABS malfunction indicator lamp", basic_area: "VEH", csa_category: "VEH", acute_indicator: false, critical_indicator: false, severity_weight: 4, citation: "49 CFR 393.55", carrier_type: ["trucking", "passenger"] },
  { violation_code: "393.75", description: "Tire failure - flat/blowout", basic_area: "VEH", csa_category: "VEH", acute_indicator: false, critical_indicator: true, severity_weight: 7, citation: "49 CFR 393.75", carrier_type: ["trucking", "passenger"] },
  { violation_code: "396.3", description: "Failure to conduct annual inspection", basic_area: "VEH", csa_category: "VEH", acute_indicator: false, critical_indicator: false, severity_weight: 5, citation: "49 CFR 396.3", carrier_type: ["trucking", "passenger"] },
  { violation_code: "396.11", description: "No driver vehicle inspection report", basic_area: "VEH", csa_category: "VEH", acute_indicator: false, critical_indicator: false, severity_weight: 5, citation: "49 CFR 396.11", carrier_type: ["trucking", "passenger"] },

  // Hazmat
  { violation_code: "171.2", description: "General hazmat requirements violation", basic_area: "SSR", csa_category: "SSR", acute_indicator: false, critical_indicator: false, severity_weight: 6, citation: "49 CFR 171.2", carrier_type: ["hazmat"] },
  { violation_code: "172.200", description: "No shipping papers or improper papers", basic_area: "SSR", csa_category: "SSR", acute_indicator: false, critical_indicator: false, severity_weight: 7, citation: "49 CFR 172.200", carrier_type: ["hazmat"] },
  { violation_code: "172.300", description: "Hazmat marking requirements violated", basic_area: "SSR", csa_category: "SSR", acute_indicator: false, critical_indicator: false, severity_weight: 6, citation: "49 CFR 172.300", carrier_type: ["hazmat"] },
  { violation_code: "172.500", description: "Hazmat placard requirements violated", basic_area: "SSR", csa_category: "SSR", acute_indicator: true, critical_indicator: true, severity_weight: 8, citation: "49 CFR 172.500", carrier_type: ["hazmat"] },
  { violation_code: "172.700", description: "No hazmat employee training record", basic_area: "SSR", csa_category: "SSR", acute_indicator: false, critical_indicator: false, severity_weight: 5, citation: "49 CFR 172.700", carrier_type: ["hazmat"] },
  { violation_code: "177.800", description: "Hazmat transportation - general requirements", basic_area: "SSR", csa_category: "SSR", acute_indicator: false, critical_indicator: false, severity_weight: 6, citation: "49 CFR 177.800", carrier_type: ["hazmat"] }
];

async function main() {
  console.log("Seeding CSA BASIC categories...\n");

  for (const cat of csaCategories) {
    const { error } = await supabase
      .from("csa_categories")
      .upsert(cat, { onConflict: "basic_code" });

    if (error) {
      console.log(`  SKIP  ${cat.basic_code}: ${error.message}`);
    } else {
      console.log(`  OK    ${cat.basic_code} - ${cat.basic_name}`);
    }
  }

  console.log("\nSeeding violation codes...\n");

  for (const v of violationCodes) {
    const { error } = await supabase
      .from("violation_codes")
      .upsert(v, { onConflict: "violation_code" });

    if (error) {
      console.log(`  SKIP  ${v.violation_code}: ${error.message}`);
    } else {
      console.log(`  OK    ${v.violation_code} (${v.basic_area})`);
    }
  }

  console.log(`\nDone: ${csaCategories.length} CSA categories, ${violationCodes.length} violation codes seeded`);
}

main().catch(console.error);
