/**
 * Seed Hours of Service rules
 * Source: 49 CFR 395 (FMCSA HOS Rules)
 * Covers: Property carriers, passenger carriers, and hazmat
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const hosRules = [
  // ---- Property Carriers (49 CFR 395.3) ----

  // Driving Time
  {
    rule_code: "HOS-PROP-11",
    category: "property",
    rule_type: "driving_time",
    title: "11-Hour Driving Limit",
    description: "A driver may drive a maximum of 11 hours after 10 consecutive hours off duty.",
    max_hours: 11,
    window_hours: 14,
    citation: "49 CFR 395.3(a)(3)(i)",
    examples: [
      "Driver starts shift after 10 hours off duty",
      "Can drive up to 11 hours before reaching mandatory off-duty time",
      "Driving beyond 11 hours is a violation"
    ],
    exemptions: [
      "Short-haul exception (395.1(e)) - if within 150 air-miles and returns to reporting location",
      "Adverse weather conditions (395.1(b)) - additional 2 hours in certain conditions"
    ]
  },

  // Duty Time
  {
    rule_code: "HOS-PROP-14",
    category: "property",
    rule_type: "duty_time",
    title: "14-Hour Duty Window",
    description: "A driver may not drive after 14 hours following 10 consecutive hours off duty. The 14-hour window does not restart with breaks or off-duty time.",
    max_hours: 14,
    window_hours: 14,
    citation: "49 CFR 395.3(a)(2)",
    examples: [
      "Driver comes on duty at 6 AM",
      "Can drive any time between 8 AM and 8 PM (11 hours driving max)",
      "Cannot drive after 8 PM even if fewer than 11 hours driven"
    ],
    exemptions: [
      "Adverse weather (395.1(b)) - 2-hour extension possible"
    ]
  },

  // 30-Minute Break
  {
    rule_code: "HOS-PROP-BRK",
    category: "property",
    rule_type: "off_duty",
    title: "30-Minute Break Requirement",
    description: "A driver must take a 30-minute break after 8 cumulative hours of driving without at least a 30-minute off-duty or sleeper berth period.",
    max_hours: 8,
    min_hours: 30,
    window_hours: 8,
    citation: "49 CFR 395.3(a)(3)(ii)",
    examples: [
      "Driver starts driving at 7 AM",
      "Must take 30-min break by 3 PM (8 hours of driving)",
      "Break can be off-duty, sleeper berth, or on-duty not driving"
    ],
    exemptions: [
      "Driver is within 50 air-miles of final destination",
      "Immediate return to home terminal"
    ]
  },

  // 60/70 Hour Limit
  {
    rule_code: "HOS-PROP-60",
    category: "property",
    rule_type: "duty_time",
    title: "60/70 Hour Limit",
    description: "A driver may not drive after 60 hours on duty in 7 consecutive days (or 70 hours in 8 consecutive days) without taking at least 34 consecutive hours off duty.",
    max_hours: 60,
    window_hours: 168,
    citation: "49 CFR 395.3(b)",
    examples: [
      "7-day limit: 60 hours on duty over any 7 consecutive days",
      "8-day limit: 70 hours on duty over any 8 consecutive days",
      "34-hour restart allows driver to reset the 60/70 hour counter"
    ],
    exemptions: [
      "Vehicle used in a local area of commerce (certain exceptions)",
      "Team drivers with split sleeper berth provisions"
    ]
  },

  // 34-Hour Restart
  {
    rule_code: "HOS-PROP-34",
    category: "property",
    rule_type: "sleeper",
    title: "34-Hour Restart Provision",
    description: "A driver may restart the 60/70 hour clock by taking at least 34 consecutive hours off duty. Restart can only be used once per 7 (or 8) consecutive days.",
    max_hours: 34,
    window_hours: 168,
    citation: "49 CFR 395.3(b)(2)",
    examples: [
      "Driver takes 34 consecutive hours off duty (includes 2 nights 10 PM - 6 AM)",
      "After restart, driver has fresh 60 or 70 hours available",
      "Restart is limited to once per rolling 7/8 day period"
    ],
    exemptions: [
      "Must include at least two periods from 1 AM to 5 AM (unless driver used during previous restart)"
    ]
  },

  // Split Sleeper Berth
  {
    rule_code: "HOS-PROP-SS",
    category: "property",
    rule_type: "sleeper",
    title: "Split Sleeper Berth Provision",
    description: "A driver may split required off-duty time into two periods using the sleeper berth, provided one period is at least 8 hours and the combined total is at least 10 hours.",
    max_hours: 10,
    window_hours: 24,
    citation: "49 CFR 395.3(a)(1)(i)",
    examples: [
      "Driver takes 5 hours off in sleeper + 5 hours off away from truck = 10 hours total",
      "Sleeper period must be at least 8 hours for the 11-hour driving window to reset"
    ],
    exemptions: [
      "Split must use sleeper berth for at least one portion",
      "Neither portion can be less than 2 hours"
    ]
  },

  // ---- Passenger Carriers (49 CFR 395.1) ----

  // Passenger - Driving Time
  {
    rule_code: "HOS-PAX-10",
    category: "passenger",
    rule_type: "driving_time",
    title: "10-Hour Driving Limit (Passenger)",
    description: "A driver of a passenger-carrying vehicle may drive a maximum of 10 hours after 8 consecutive hours off duty.",
    max_hours: 10,
    window_hours: 15,
    citation: "49 CFR 395.1(a)(2)",
    examples: [
      "Bus driver starts after 8 hours consecutive off duty",
      "Can drive up to 10 hours before required break"
    ],
    exemptions: [
      "Special or charter operations may have different rules"
    ]
  },

  // Passenger - On Duty
  {
    rule_code: "HOS-PAX-15",
    category: "passenger",
    rule_type: "duty_time",
    title: "15-Hour Duty Window (Passenger)",
    description: "A driver may not drive after 15 hours following 8 consecutive hours off duty.",
    max_hours: 15,
    window_hours: 15,
    citation: "49 CFR 395.1(a)(2)",
    examples: [
      "Driver on duty 7 AM - 10 PM",
      "Cannot drive after 10 PM even with fewer than 10 hours driving"
    ],
    exemptions: []
  },

  // Passenger - 60 Hour Limit
  {
    rule_code: "HOS-PAX-60",
    category: "passenger",
    rule_type: "duty_time",
    title: "60/70 Hour Limit (Passenger)",
    description: "Passenger carrier drivers may not drive after 60 hours on duty in 7 consecutive days (70 hours in 8 consecutive days) without at least 8 consecutive hours off duty.",
    max_hours: 60,
    window_hours: 168,
    citation: "49 CFR 395.1(a)(1)",
    examples: [
      "60 hours in any 7 consecutive days",
      "8 consecutive hours off duty restores driving eligibility"
    ],
    exemptions: []
  },

  // 8-Hour Driving Limit (Passenger - different from 10)
  {
    rule_code: "HOS-PAX-8",
    category: "passenger",
    rule_type: "driving_time",
    title: "8-Hour Driving with Break (Passenger)",
    description: "No driver shall drive more than 8 hours without a break of at least 30 consecutive minutes.",
    max_hours: 8,
    min_hours: 30,
    window_hours: 8,
    citation: "49 CFR 395.1(a)(2)",
    examples: [
      "Driver drives for 8 hours",
      "Must take 30-minute break before continuing",
      "Break must be off-duty time"
    ],
    exemptions: []
  },

  // ---- Hazmat Carriers ----
  // Hazmat follows property carrier rules but with additional restrictions
  {
    rule_code: "HOS-HAZ-11",
    category: "hazmat",
    rule_type: "driving_time",
    title: "11-Hour Driving Limit (Hazmat)",
    description: "Same as property carriers. Driver may drive a maximum of 11 hours after 10 consecutive hours off duty. Additional hazmat-specific restrictions may apply based on the materials being transported.",
    max_hours: 11,
    window_hours: 14,
    citation: "49 CFR 395.3; 49 CFR 397.1",
    examples: [
      "Flammable liquid carrier subject to same 11-hour rule",
      "May have additional rest requirements for certain materials"
    ],
    exemptions: [
      "See property carrier exemptions for base HOS rules",
      "Additional exemptions may apply for specific hazmat situations (397.1)"
    ]
  }
];

async function main() {
  console.log("Seeding Hours of Service rules...\n");

  for (const rule of hosRules) {
    const { error } = await supabase
      .from("hos_rules")
      .upsert(rule, { onConflict: "rule_code" });

    if (error) {
      console.log(`  SKIP  ${rule.rule_code}: ${error.message}`);
    } else {
      console.log(`  OK    ${rule.rule_code} (${rule.category}/${rule.rule_type})`);
    }
  }

  console.log(`\nDone: ${hosRules.length} HOS rules seeded`);
  console.log("Citations reference 49 CFR 395 (FMCSA HOS Rules)");
}

main().catch(console.error);
