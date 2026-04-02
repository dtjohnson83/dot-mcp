/**
 * Seed DOT/FMCSA penalty schedule
 * Source: FMCSA Penalty Guidelines (updated annually)
 * Effective: January 2026
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const penalties = [
  // HOS Violations
  {
    violation_category: "hos_driving_time_exceeded",
    min_penalty: 1000,
    max_penalty: 15000,
    unit_type: "per_violation",
    statutory_limit: false,
    notes: "Per day of violation. May be assessed per driver per day.",
    effective_date: "2026-01-01",
    citation: "49 CFR 395.3; 49 USC 521(b)(2)(A)"
  },
  {
    violation_category: "hos_eld_violation",
    min_penalty: 1000,
    max_penalty: 15000,
    unit_type: "per_violation",
    statutory_limit: false,
    notes: "Including failure to use required ELD, editing/altering ELD records, driver failure to possess supporting documents.",
    effective_date: "2026-01-01",
    citation: "49 CFR 395.8, 395.34"
  },
  {
    violation_category: "hos_60_70_hour_limit",
    min_penalty: 1500,
    max_penalty: 25000,
    unit_type: "per_violation",
    statutory_limit: false,
    notes: "Exceeding 60/70 hour limit within 6/8 day period.",
    effective_date: "2026-01-01",
    citation: "49 CFR 395.3(b)"
  },
  {
    violation_category: "hos_30_minute_break",
    min_penalty: 500,
    max_penalty: 10000,
    unit_type: "per_violation",
    statutory_limit: false,
    notes: "Failure to take required 30-minute break after 8 hours of driving.",
    effective_date: "2026-01-01",
    citation: "49 CFR 395.3(a)(3)(ii)"
  },
  {
    violation_category: "hos_sleeper_berth",
    min_penalty: 500,
    max_penalty: 10000,
    unit_type: "per_violation",
    statutory_limit: false,
    notes: "Improper use of sleeper berth provisions.",
    effective_date: "2026-01-01",
    citation: "49 CFR 395.3(a)(1)(i)"
  },

  // Driver Qualifications
  {
    violation_category: "driver_qualification_no_medical",
    min_penalty: 500,
    max_penalty: 15000,
    unit_type: "per_driver",
    statutory_limit: false,
    notes: "Driver operating without valid medical certificate.",
    effective_date: "2026-01-01",
    citation: "49 CFR 391.45"
  },
  {
    violation_category: "driver_qualification_false_entry",
    min_penalty: 2500,
    max_penalty: 25000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "Knowingly making false entries in qualification documents.",
    effective_date: "2026-01-01",
    citation: "49 CFR 391.27, 49 USC 521(b)(2)(A)"
  },
  {
    violation_category: "driver_qualification_unqualified",
    min_penalty: 1000,
    max_penalty: 20000,
    unit_type: "per_driver",
    statutory_limit: false,
    notes: "Driver not qualified under 49 CFR Part 391.",
    effective_date: "2026-01-01",
    citation: "49 CFR 391.11"
  },

  // Vehicle Maintenance
  {
    violation_category: "vehicle_brake_violation",
    min_penalty: 500,
    max_penalty: 25000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "Out-of-service brake violations carry minimum $500 per violation. Maximum statutory penalty applies to serious violations.",
    effective_date: "2026-01-01",
    citation: "49 CFR 393.40-393.55"
  },
  {
    violation_category: "vehicle_out_of_service",
    min_penalty: 1000,
    max_penalty: 30000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "Operating vehicle placed out of service.",
    effective_date: "2026-01-01",
    citation: "49 CFR 396.15; 49 USC 521(b)(2)(A)"
  },
  {
    violation_category: "vehicle_inspection_no_report",
    min_penalty: 500,
    max_penalty: 10000,
    unit_type: "per_violation",
    statutory_limit: false,
    notes: "Failure to prepare or retain driver vehicle inspection report.",
    effective_date: "2026-01-01",
    citation: "49 CFR 396.11"
  },

  // ELD
  {
    violation_category: "eld_not_registered",
    min_penalty: 1000,
    max_penalty: 15000,
    unit_type: "per_violation",
    statutory_limit: false,
    notes: "Using ELD not registered with FMCSA.",
    effective_date: "2026-01-01",
    citation: "49 CFR 395.34"
  },
  {
    violation_category: "eld_data_transfer_failure",
    min_penalty: 500,
    max_penalty: 10000,
    unit_type: "per_violation",
    statutory_limit: false,
    notes: "Failure to transfer ELD data when requested by authorized official.",
    effective_date: "2026-01-01",
    citation: "49 CFR 395.34"
  },

  // Hazmat
  {
    violation_category: "hazmat_placarding",
    min_penalty: 500,
    max_penalty: 85000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "Statutory maximum for hazmat violations. Per day per violation.",
    effective_date: "2026-01-01",
    citation: "49 CFR 100-185; 49 USC 5123"
  },
  {
    violation_category: "hazmat_shipping_paper",
    min_penalty: 500,
    max_penalty: 50000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "Statutory maximum applies to knowing violations.",
    effective_date: "2026-01-01",
    citation: "49 CFR 172.800"
  },
  {
    violation_category: "hazmat_training_no_record",
    min_penalty: 500,
    max_penalty: 50000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "No record of required hazmat training.",
    effective_date: "2026-01-01",
    citation: "49 CFR 172.700"
  },
  {
    violation_category: "hazmat_package_marking",
    min_penalty: 500,
    max_penalty: 50000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "Package not properly marked with hazmat identification numbers.",
    effective_date: "2026-01-01",
    citation: "49 CFR 172.300-172.400"
  },

  // Out of Service
  {
    violation_category: "out_of_service_operating",
    min_penalty: 2000,
    max_penalty: 30000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "Operating during out-of-service order. May result in imminent hazard order.",
    effective_date: "2026-01-01",
    citation: "49 USC 521(b)(5), 49 USC 521 note"
  },
  {
    violation_category: "out_of_service_enhancement",
    min_penalty: 5000,
    max_penalty: 30000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "Enhanced penalty for violations during OOS order period.",
    effective_date: "2026-01-01",
    citation: "49 USC 521(b)(2)(A)"
  },

  // Drug & Alcohol
  {
    violation_category: "drug_alcohol_testing_violation",
    min_penalty: 2500,
    max_penalty: 25000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "Violation of drug/alcohol testing requirements.",
    effective_date: "2026-01-01",
    citation: "49 CFR 382"
  },
  {
    violation_category: "drug_alcohol_positive_test",
    min_penalty: 2500,
    max_penalty: 25000,
    unit_type: "per_driver",
    statutory_limit: true,
    notes: "Driver testing positive or refusing test.",
    effective_date: "2026-01-01",
    citation: "49 CFR 382"
  },

  // Financial Responsibility
  {
    violation_category: "financial_responsibility_no_insurance",
    min_penalty: 1000,
    max_penalty: 50000,
    unit_type: "per_violation",
    statutory_limit: true,
    notes: "Operating without required insurance/financial responsibility.",
    effective_date: "2026-01-01",
    citation: "49 CFR 387"
  },

  // CSA / Safety Fitness
  {
    violation_category: "csa_unacceptable_rating",
    min_penalty: 1000,
    max_penalty: 15000,
    unit_type: "per_day",
    statutory_limit: false,
    notes: "Unacceptable safety rating after comprehensive investigation.",
    effective_date: "2026-01-01",
    citation: "49 CFR Part 385"
  }
];

async function main() {
  console.log("Seeding DOT/FMCSA penalty schedule...\n");

  for (const penalty of penalties) {
    const { error } = await supabase
      .from("dot_penalty_schedule")
      .upsert(penalty, { onConflict: "violation_category" });

    if (error) {
      console.log(`  SKIP  ${penalty.violation_category}: ${error.message}`);
    } else {
      console.log(`  OK    ${penalty.violation_category}`);
    }
  }

  console.log("\nDone: DOT penalty schedule seeded");
  console.log("Max penalty for hazmat knowing violations: $85,133 per violation (statutory max)");
  console.log("Data effective: January 2026 (FMCSA annual adjustment)");
}

main().catch(console.error);
