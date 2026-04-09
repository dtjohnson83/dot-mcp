import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

const PENALTIES = [
  { violation_category: "hos_driving_time_exceeded", min_penalty: 1000, max_penalty: 15000, unit_type: "per_violation", statutory_limit: false, notes: "Per day of violation. May be assessed per driver per day.", effective_date: "2026-01-01", citation: "49 CFR 395.3; 49 USC 521(b)(2)(A)" },
  { violation_category: "hos_eld_violation", min_penalty: 1000, max_penalty: 15000, unit_type: "per_violation", statutory_limit: false, notes: "Including failure to use required ELD, editing/altering ELD records, driver failure to possess supporting documents.", effective_date: "2026-01-01", citation: "49 CFR 395.8, 395.34" },
  { violation_category: "hos_60_70_hour_limit", min_penalty: 1500, max_penalty: 25000, unit_type: "per_violation", statutory_limit: false, notes: "Exceeding 60/70 hour limit within 6/8 day period.", effective_date: "2026-01-01", citation: "49 CFR 395.3(b)" },
  { violation_category: "hos_30_minute_break", min_penalty: 500, max_penalty: 10000, unit_type: "per_violation", statutory_limit: false, notes: "Failure to take required 30-minute break after 8 hours of driving.", effective_date: "2026-01-01", citation: "49 CFR 395.3(a)(3)(ii)" },
  { violation_category: "hos_sleeper_berth", min_penalty: 500, max_penalty: 10000, unit_type: "per_violation", statutory_limit: false, notes: "Improper use of sleeper berth provisions.", effective_date: "2026-01-01", citation: "49 CFR 395.3(a)(1)(i)" },
  { violation_category: "driver_qualification_no_medical", min_penalty: 500, max_penalty: 15000, unit_type: "per_driver", statutory_limit: false, notes: "Driver operating without valid medical certificate.", effective_date: "2026-01-01", citation: "49 CFR 391.45" },
  { violation_category: "driver_qualification_false_entry", min_penalty: 2500, max_penalty: 25000, unit_type: "per_violation", statutory_limit: true, notes: "Knowingly making false entries in qualification documents.", effective_date: "2026-01-01", citation: "49 CFR 391.27, 49 USC 521(b)(2)(A)" },
  { violation_category: "driver_qualification_unqualified", min_penalty: 1000, max_penalty: 20000, unit_type: "per_driver", statutory_limit: false, notes: "Driver not qualified under 49 CFR Part 391.", effective_date: "2026-01-01", citation: "49 CFR 391.11" },
  { violation_category: "vehicle_brake_violation", min_penalty: 500, max_penalty: 25000, unit_type: "per_violation", statutory_limit: true, notes: "Out-of-service brake violations carry minimum $500 per violation. Maximum statutory penalty applies to serious violations.", effective_date: "2026-01-01", citation: "49 CFR 393.40-393.55" },
  { violation_category: "vehicle_out_of_service", min_penalty: 1000, max_penalty: 30000, unit_type: "per_violation", statutory_limit: true, notes: "Operating vehicle placed out of service.", effective_date: "2026-01-01", citation: "49 CFR 396.15; 49 USC 521(b)(2)(A)" },
  { violation_category: "vehicle_inspection_no_report", min_penalty: 500, max_penalty: 10000, unit_type: "per_violation", statutory_limit: false, notes: "Failure to prepare or retain driver vehicle inspection report.", effective_date: "2026-01-01", citation: "49 CFR 396.11" },
  { violation_category: "eld_not_registered", min_penalty: 1000, max_penalty: 15000, unit_type: "per_violation", statutory_limit: false, notes: "Using ELD not registered with FMCSA.", effective_date: "2026-01-01", citation: "49 CFR 395.34" },
  { violation_category: "eld_data_transfer_failure", min_penalty: 500, max_penalty: 10000, unit_type: "per_violation", statutory_limit: false, notes: "Failure to transfer ELD data when requested by authorized official.", effective_date: "2026-01-01", citation: "49 CFR 395.34" },
  { violation_category: "hazmat_placarding", min_penalty: 500, max_penalty: 85000, unit_type: "per_violation", statutory_limit: true, notes: "Statutory maximum for hazmat violations. Per day per violation.", effective_date: "2026-01-01", citation: "49 CFR 100-185; 49 USC 5123" },
  { violation_category: "hazmat_shipping_paper", min_penalty: 500, max_penalty: 50000, unit_type: "per_violation", statutory_limit: true, notes: "Statutory maximum applies to knowing violations.", effective_date: "2026-01-01", citation: "49 CFR 172.800" },
  { violation_category: "hazmat_training_no_record", min_penalty: 500, max_penalty: 50000, unit_type: "per_violation", statutory_limit: true, notes: "No record of required hazmat training.", effective_date: "2026-01-01", citation: "49 CFR 172.700" },
  { violation_category: "hazmat_package_marking", min_penalty: 500, max_penalty: 50000, unit_type: "per_violation", statutory_limit: true, notes: "Package not properly marked with hazmat identification numbers.", effective_date: "2026-01-01", citation: "49 CFR 172.300-172.400" },
  { violation_category: "out_of_service_operating", min_penalty: 2000, max_penalty: 30000, unit_type: "per_violation", statutory_limit: true, notes: "Operating during out-of-service order. May result in imminent hazard order.", effective_date: "2026-01-01", citation: "49 USC 521(b)(5), 49 USC 521 note" },
  { violation_category: "out_of_service_enhancement", min_penalty: 5000, max_penalty: 30000, unit_type: "per_violation", statutory_limit: true, notes: "Enhanced penalty for violations during OOS order period.", effective_date: "2026-01-01", citation: "49 USC 521(b)(2)(A)" },
  { violation_category: "drug_alcohol_testing_violation", min_penalty: 2500, max_penalty: 25000, unit_type: "per_violation", statutory_limit: true, notes: "Violation of drug/alcohol testing requirements.", effective_date: "2026-01-01", citation: "49 CFR 382" },
  { violation_category: "drug_alcohol_positive_test", min_penalty: 2500, max_penalty: 25000, unit_type: "per_driver", statutory_limit: true, notes: "Driver testing positive or refusing test.", effective_date: "2026-01-01", citation: "49 CFR 382" },
  { violation_category: "financial_responsibility_no_insurance", min_penalty: 1000, max_penalty: 50000, unit_type: "per_violation", statutory_limit: true, notes: "Operating without required insurance coverage.", effective_date: "2026-01-01", citation: "49 CFR 387" },
];

const HOS_RULES = [
  { rule_code: "HOS-PROP-11", category: "property", rule_type: "driving_time", title: "11-Hour Driving Limit", description: "A driver may drive a maximum of 11 hours after 10 consecutive hours off duty.", max_hours: 11, window_hours: 14, citation: "49 CFR 395.3(a)(3)(i)", examples: ["Driver starts shift after 10 hours off duty", "Can drive up to 11 hours before reaching mandatory off-duty time"], exemptions: ["Short-haul exception (395.1(e))", "Adverse weather conditions (395.1(b))"] },
  { rule_code: "HOS-PROP-14", category: "property", rule_type: "duty_time", title: "14-Hour Duty Window", description: "A driver may not drive after 14 hours following 10 consecutive hours off duty.", max_hours: 14, window_hours: 14, citation: "49 CFR 395.3(a)(2)", examples: ["Driver comes on duty at 6 AM", "Cannot drive after 8 PM even if fewer than 11 hours driven"], exemptions: ["Adverse weather (395.1(b))"] },
  { rule_code: "HOS-PROP-BRK", category: "property", rule_type: "off_duty", title: "30-Minute Break Requirement", description: "A driver must take a 30-minute break after 8 cumulative hours of driving without at least a 30-minute off-duty period.", max_hours: 8, min_hours: 30, window_hours: 8, citation: "49 CFR 395.3(a)(3)(ii)", examples: ["Driver starts driving at 7 AM", "Must take 30-min break by 3 PM"], exemptions: ["Driver is within 50 air-miles of final destination"] },
  { rule_code: "HOS-PROP-60", category: "property", rule_type: "duty_time", title: "60/70 Hour Limit", description: "A driver may not drive after 60 hours on duty in 7 consecutive days (or 70 hours in 8 consecutive days) without at least 34 consecutive hours off duty.", max_hours: 60, window_hours: 168, citation: "49 CFR 395.3(b)", examples: ["7-day limit: 60 hours on duty over any 7 consecutive days", "34-hour restart allows driver to reset the 60/70 hour counter"], exemptions: ["Vehicle used in a local area of commerce"] },
  { rule_code: "HOS-PROP-34", category: "property", rule_type: "sleeper", title: "34-Hour Restart Provision", description: "A driver may restart the 60/70 hour clock by taking at least 34 consecutive hours off duty.", max_hours: 34, window_hours: 168, citation: "49 CFR 395.3(b)(2)", examples: ["Driver takes 34 consecutive hours off duty", "Restart is limited to once per rolling 7/8 day period"], exemptions: ["Must include at least two periods from 1 AM to 5 AM"] },
  { rule_code: "HOS-PROP-SS", category: "property", rule_type: "sleeper", title: "Split Sleeper Berth Provision", description: "A driver may split required off-duty time into two periods using the sleeper berth, provided one period is at least 8 hours.", max_hours: 10, window_hours: 24, citation: "49 CFR 395.3(a)(1)(i)", examples: ["Driver takes 5 hours off in sleeper + 5 hours off away from truck = 10 hours total"], exemptions: ["Neither portion can be less than 2 hours"] },
  { rule_code: "HOS-PAX-10", category: "passenger", rule_type: "driving_time", title: "10-Hour Driving Limit (Passenger)", description: "A driver of a passenger-carrying vehicle may drive a maximum of 10 hours after 8 consecutive hours off duty.", max_hours: 10, window_hours: 15, citation: "49 CFR 395.1(a)(2)", examples: ["Bus driver starts after 8 hours consecutive off duty", "Can drive up to 10 hours before required break"], exemptions: [] },
  { rule_code: "HOS-PAX-15", category: "passenger", rule_type: "duty_time", title: "15-Hour Duty Window (Passenger)", description: "A driver may not drive after 15 hours following 8 consecutive hours off duty.", max_hours: 15, window_hours: 15, citation: "49 CFR 395.1(a)(2)", examples: ["Driver on duty 7 AM - 10 PM", "Cannot drive after 10 PM"], exemptions: [] },
  { rule_code: "HOS-PAX-60", category: "passenger", rule_type: "duty_time", title: "60/70 Hour Limit (Passenger)", description: "Passenger carrier drivers may not drive after 60 hours on duty in 7 consecutive days without at least 8 consecutive hours off duty.", max_hours: 60, window_hours: 168, citation: "49 CFR 395.1(a)(1)", examples: ["60 hours in any 7 consecutive days"], exemptions: [] },
  { rule_code: "HOS-PAX-8", category: "passenger", rule_type: "driving_time", title: "8-Hour Driving with Break (Passenger)", description: "No driver shall drive more than 8 hours without a break of at least 30 consecutive minutes.", max_hours: 8, min_hours: 30, window_hours: 8, citation: "49 CFR 395.1(a)(2)", examples: ["Driver drives for 8 hours", "Must take 30-minute break before continuing"], exemptions: [] },
  { rule_code: "HOS-HAZ-11", category: "hazmat", rule_type: "driving_time", title: "11-Hour Driving Limit (Hazmat)", description: "A driver transporting hazardous materials subject to 49 CFR 397 may drive a maximum of 11 hours after 10 consecutive hours off duty.", max_hours: 11, window_hours: 14, citation: "49 CFR 397.5", examples: ["Driver subject to hazmat rest requirements", "Driving time limited to 11 hours after 10 hours off duty"], exemptions: ["Emergency conditions"] },
  { rule_code: "HOS-HAZ-60", category: "hazmat", rule_type: "duty_time", title: "60 Hour Limit (Hazmat)", description: "A driver transporting hazardous materials may not drive after 60 hours on duty in 6 consecutive days without 24 consecutive hours off duty.", max_hours: 60, window_hours: 144, citation: "49 CFR 397.5", examples: ["60 hours in any 6 consecutive days", "24-hour restart required"], exemptions: ["Emergency conditions"] },
];

const CSA_CATEGORIES = [
  { basic_code: "HOS", basic_name: "Hours of Service Compliance", description: "Measures violations related to driver hours of service, including electronic logging device (ELD) compliance, logbook violations, and HOS limit exceedements.", severity_ratings: ["Severity 7: HOS-driving time exceeded", "Severity 7: HOS-60/70 hour limit exceeded", "Severity 5: HOS-30 minute break violation", "Severity 8: Falsifying records of duty status"], intervention_thresholds: ["Alert threshold: BASIC measure >= 65%", "Priority intervention: >= 80%", "Investigation threshold: >= 90%"], carrier_type: ["trucking", "passenger", "hazmat"], citation: "49 CFR Part 395; FMCSA CSA Program" },
  { basic_code: "DRF", basic_name: "Driver Fitness", description: "Measures violations related to driver qualifications, including medical certificates, licenses, and driver fitness requirements.", severity_ratings: ["Severity 8: Driver not qualified", "Severity 7: False statement on qualification documents", "Severity 6: Driver under 21 years in interstate commerce"], intervention_thresholds: ["Alert threshold varies by carrier size and BASIC percentile"], carrier_type: ["trucking", "passenger"], citation: "49 CFR Part 391" },
  { basic_code: "BDD", basic_name: "Unsafe Driving", description: "Measures violations related to careless or dangerous driving behaviors, including speeding, reckless driving, improper lane changes.", severity_ratings: ["Severity 8: Reckless driving", "Severity 7: Excessive speeding (15+ mph)", "Severity 6: Speeding 10-14 mph over limit", "Severity 5: Following too close"], intervention_thresholds: ["Unsafe driving violations weighted heavily in CSA scoring"], carrier_type: ["trucking", "passenger"], citation: "49 CFR 392; FMCSA CSA Program" },
  { basic_code: "VEH", basic_name: "Vehicle Maintenance", description: "Measures violations related to vehicle mechanical fitness, including brakes, lights, tires, steering, and other critical safety components.", severity_ratings: ["Severity 8: Inoperative brakes (out of service)", "Severity 7: Steering component failure", "Severity 6: Tire violation", "Severity 5: Lighting violations"], intervention_thresholds: ["Out-of-service vehicle violations carry highest severity"], carrier_type: ["trucking", "passenger", "hazmat"], citation: "49 CFR Parts 393, 396; FMCSA CSA Program" },
  { basic_code: "MAC", basic_name: "Controlled Substances / Alcohol", description: "Measures violations related to drug and alcohol use by drivers, including positive drug tests, alcohol possession, and refusal to submit to testing.", severity_ratings: ["Severity 10: Driver under influence of alcohol/drugs", "Severity 10: Refusal to submit to drug/alcohol test", "Severity 8: Positive drug test result"], intervention_thresholds: ["Any MAC violation triggers immediate investigation"], carrier_type: ["trucking", "passenger"], citation: "49 CFR Part 382; FMCSA CSA Program" },
  { basic_code: "SSR", basic_name: "Hazardous Materials Safety", description: "Measures violations related to the transportation of hazardous materials, including proper placarding, shipping papers, packaging, and training.", severity_ratings: ["Severity 8: Hazmat packaging/containment failure", "Severity 8: Hazmat placarding violations", "Severity 7: Hazmat shipping paper violations"], intervention_thresholds: ["Hazmat violations can result in out-of-service orders"], carrier_type: ["hazmat"], citation: "49 CFR Parts 100-185; FMCSA CSA Program" },
  { basic_code: "VEO", basic_name: "Vehicle Financial Responsibility", description: "Measures violations related to proof of insurance and financial responsibility.", severity_ratings: ["Severity 8: Operating without required insurance", "Severity 7: Failure to maintain proof of insurance documents"], intervention_thresholds: ["VEO violations can trigger loss of operating authority"], carrier_type: ["trucking", "passenger", "hazmat"], citation: "49 CFR Part 387" },
];

const HAZMAT_CLASSES = [
  { class_number: "1.1", class_name: "Mass Explosion Hazard", division: "1", description: "Mass explosion hazard which affects the entire load instantaneously.", key_requirements: ["Must be transported by authorized carrier with HM endorsement", "Driver must have HM training per 49 CFR 172.700", "Placarding required per 49 CFR 172.500"], marking_requirements: ["EX number assigned by DOT (e.g., UN0481)", "Division 1.1 placard required"], labeling_requirements: ["Division 1.1 EXPLOSIVES label (orange)"], placard_requirements: ["EXPLOSIVES 1.1 (orange)"], training_requirements: "Drivers must receive hazmat training covering all 7 general topics per 49 CFR 172.700.", citation: "49 CFR Parts 100-185; 172 Subparts D, E, F" },
  { class_number: "1.4", class_name: "No Mass Explosion Hazard", division: "1", description: "Explosives with no mass explosion hazard. Division 1.4 explosives present a fire or projection hazard.", key_requirements: ["Less restrictive than Division 1.1", "Still requires HM endorsement and training"], marking_requirements: ["Compatibility class letter required", "UN number marking"], labeling_requirements: ["Division 1.4 EXPLOSIVES label"], placard_requirements: ["EXPLOSIVES 1.4 (orange) if in quantities requiring placard"], training_requirements: "Full hazmat training required.", citation: "49 CFR 172.400; 172.500" },
  { class_number: "2.1", class_name: "Flammable Gas", division: "2", description: "Gases which ignite on contact with an ignition source. Includes propane, butane, methane, hydrogen.", key_requirements: ["Non-bulk packaging: Mark with UN number on each package", "Bulk packaging: DOT specification cylinder or tank required", "Driver HM endorsement required"], marking_requirements: ["UN number (e.g., UN1075 for LPG)", "FLAMMABLE GAS placard on transport vehicle"], labeling_requirements: ["FLAMMABLE GAS label (red diamond)"], placard_requirements: ["FLAMMABLE GAS placard (red diamond)"], training_requirements: "Full hazmat training required for any driver transporting Division 2.1.", citation: "49 CFR 172.101; 172.400; 177.800" },
  { class_number: "2.2", class_name: "Non-Flammable Non-Toxic Gas", division: "2", description: "Non-flammable, non-toxic gases including nitrogen, oxygen, argon, helium, and CO2.", key_requirements: ["Compressed gas cylinders must meet DOT specification", "Oxygen shipments require special handling (no oil/grease on fittings)"], marking_requirements: ["UN number on each package", "NON-FLAMMABLE GAS placard"], labeling_requirements: ["NON-FLAMMABLE GAS label (green diamond)"], placard_requirements: ["NON-FLAMMABLE GAS placard (green)"], training_requirements: "General hazmat awareness training required.", citation: "49 CFR 172.101; 173.302" },
  { class_number: "2.3", class_name: "Toxic Gas", division: "2", description: "Gases known to be toxic to humans. Includes chlorine, ammonia (anhydrous), fluorine, hydrogen cyanide.", key_requirements: ["Toxic gas placard required", "Inhalation hazard label required when applicable", "Driver HM endorsement required"], marking_requirements: ["UN number", "TOXIC GAS placard", "INHALATION HAZARD marking when applicable"], labeling_requirements: ["TOXIC GAS label (white diamond)", "Poison Inhalation Hazard label when applicable"], placard_requirements: ["TOXIC GAS placard (white)", "POISON INHALATION HAZARD placard when applicable"], training_requirements: "Full hazmat training including toxic gas specifics required.", citation: "49 CFR 172.101; 173.300; 177.800" },
  { class_number: "3", class_name: "Flammable Liquid", division: "3", description: "Flammable liquids with a flash point below 141°F (60.5°C). Includes gasoline, diesel fuel, acetone, methanol.", key_requirements: ["PG I (flash point below 73°F): most restrictive packaging", "PG II (73-100°F): intermediate packaging", "PG III (100-141°F): least restrictive", "Driver HM endorsement required for bulk shipments"], marking_requirements: ["UN number on each package", "Flash point statement may be required"], labeling_requirements: ["FLAMMABLE LIQUID label (red)"], placard_requirements: ["FLAMMABLE placard (red)"], training_requirements: "Full hazmat training required. Function-specific training on flammable liquid properties required.", citation: "49 CFR 172.101; 173.120; 177.800" },
  { class_number: "4.1", class_name: "Flammable Solid", division: "4", description: "Flammable solids including magnesium, sodium, sulfur, and substances that can cause fire through friction.", key_requirements: ["Must be protected against ignition and fire", "Driver HM endorsement required"], marking_requirements: ["UN number", "FLAMMABLE SOLID placard"], labeling_requirements: ["FLAMMABLE SOLID label (red/white stripes)"], placard_requirements: ["FLAMMABLE SOLID placard (red/white stripes)"], training_requirements: "Full hazmat training required.", citation: "49 CFR 172.400; 174.800" },
  { class_number: "4.3", class_name: "Dangerous When Wet", division: "4", description: "Substances that emit flammable gases when wet. Includes sodium, potassium, calcium carbide, lithium.", key_requirements: ["Must be kept dry at all times", "Driver HM endorsement required"], marking_requirements: ["UN number", "DANGEROUS WHEN WET placard"], labeling_requirements: ["FLAMMABLE SOLID label with 'DANGEROUS WHEN WET' notation"], placard_requirements: ["DANGEROUS WHEN WET placard (blue)"], training_requirements: "Full hazmat training required.", citation: "49 CFR 172.400; 174.800" },
  { class_number: "5.1", class_name: "Oxidizer", division: "5", description: "Oxidizers that can cause or enhance the combustion of other materials.", key_requirements: ["Must be segregated from flammable materials", "Driver HM endorsement required for some oxidizers"], marking_requirements: ["UN number on each package"], labeling_requirements: ["OXIDIZER label (yellow diamond with 'OXIDIZER')"], placard_requirements: ["OXIDIZER placard (yellow)"], training_requirements: "Full hazmat training required for any driver transporting Division 5.1.", citation: "49 CFR 172.101; 173.127" },
  { class_number: "5.2", class_name: "Organic Peroxide", division: "5", description: "Organic peroxides that are thermally unstable and can decompose exothermically.", key_requirements: ["Temperature control may be required", "Driver HM endorsement required"], marking_requirements: ["UN number on each package", "Organic peroxide label or placard as applicable"], labeling_requirements: ["ORGANIC PEROXIDE label (yellow/red)"], placard_requirements: ["ORGANIC PEROXIDE placard as applicable"], training_requirements: "Full hazmat training required.", citation: "49 CFR 172.101; 173.128" },
  { class_number: "6.1", class_name: "Toxic", division: "6", description: "Toxic substances that can cause death or serious injury if swallowed, inhaled, or skin contact occurs.", key_requirements: ["Poison/Toxic placard required for most", "Driver HM endorsement required", "Inhalation hazard requires additional marking"], marking_requirements: ["UN number on each package", "Toxic/POISON marking required"], labeling_requirements: ["TOXIC label (skull and crossbones)", "INHALATION HAZARD label when applicable"], placard_requirements: ["POISON / TOXIC placard (white)", "POISON INHALATION HAZARD placard when applicable"], training_requirements: "Full hazmat training required.", citation: "49 CFR 172.101; 173.200" },
  { class_number: "7", class_name: "Radioactive Material", division: "7", description: "Radioactive materials regulated by the Nuclear Regulatory Commission and DOT.", key_requirements: ["Dosimetry requirements", "Driver HM endorsement required", "Special packaging requirements"], marking_requirements: ["Radioactive material label (yellow/white)", "UN number and proper shipping name"], labeling_requirements: ["RADIOACTIVE label (yellow/white)", "Category I, II, or III designation required"], placard_requirements: ["RADIOACTIVE placard (yellow/white triangle)"], training_requirements: "Full hazmat training including radiation safety required.", citation: "49 CFR Parts 171-177; 10 CFR Part 71" },
  { class_number: "8", class_name: "Corrosive", division: "8", description: "Corrosive materials that cause visible destruction or irreversible alterations in human skin tissue.", key_requirements: ["Corrosive placard required", "Driver HM endorsement required for bulk", "Must be segregated from other cargo"], marking_requirements: ["UN number on each package", "CORROSIVE marking"], labeling_requirements: ["CORROSIVE label (black/white diamond with 'CORROSIVE')"], placard_requirements: ["CORROSIVE placard (black/white diamond)"], training_requirements: "Full hazmat training required.", citation: "49 CFR 172.101; 173.240" },
  { class_number: "9", class_name: "Miscellaneous Dangerous Goods", division: "9", description: "Miscellaneous hazardous materials that do not meet the definition of other classes. Includes dry ice, lithium batteries, asbestos.", key_requirements: ["Some Division 9 materials require HM endorsement", "Lithium battery specific requirements apply"], marking_requirements: ["UN number on each package", "Class 9 placard/labels as applicable"], labeling_requirements: ["CLASS 9 label (white diamond with '9')"], placard_requirements: ["Class 9 placard (white diamond with '9') for bulk"], training_requirements: "General hazmat awareness training required. Function-specific training for lithium batteries.", citation: "49 CFR 172.101; 173.300" },
];

// ---------------------------------------------------------------------------
// Seed Functions
// ---------------------------------------------------------------------------

async function seedPenalties(supabase: ReturnType<typeof createClient>) {
  await supabase.from("dot_penalty_schedule").delete().neq("violation_category", "placeholder");
  const { error } = await supabase.from("dot_penalty_schedule").insert(PENALTIES);
  if (error) throw new Error(`seed-penalties failed: ${error.message}`);
}

async function seedHOS(supabase: ReturnType<typeof createClient>) {
  await supabase.from("hos_rules").delete().neq("rule_code", "placeholder");
  const { error } = await supabase.from("hos_rules").insert(HOS_RULES);
  if (error) throw new Error(`seed-hos failed: ${error.message}`);
}

async function seedCSA(supabase: ReturnType<typeof createClient>) {
  await supabase.from("csa_categories").delete().neq("basic_code", "placeholder");
  const { error: catError } = await supabase.from("csa_categories").insert(CSA_CATEGORIES);
  if (catError) throw new Error(`seed-csa (categories) failed: ${catError.message}`);
}

async function seedHazmat(supabase: ReturnType<typeof createClient>) {
  await supabase.from("hazmat_classifications").delete().neq("class_number", "placeholder");
  const { error } = await supabase.from("hazmat_classifications").insert(HAZMAT_CLASSES);
  if (error) throw new Error(`seed-hazmat failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const results: Record<string, { success: boolean; error?: string }> = {};

  const seeds = [
    { name: "penalties", fn: () => seedPenalties(supabase) },
    { name: "hos", fn: () => seedHOS(supabase) },
    { name: "csa", fn: () => seedCSA(supabase) },
    { name: "hazmat", fn: () => seedHazmat(supabase) },
  ];

  for (const seed of seeds) {
    try {
      await seed.fn();
      results[seed.name] = { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results[seed.name] = { success: false, error: message };
    }
  }

  const allSucceeded = Object.values(results).every((r) => r.success);

  return NextResponse.json(
    {
      refreshed_at: new Date().toISOString(),
      results,
    },
    { status: allSucceeded ? 200 : 207 }
  );
}

