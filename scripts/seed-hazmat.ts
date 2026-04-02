/**
 * Seed DOT Hazardous Materials Classifications
 * Source: 49 CFR Parts 100-185 (HMTA/HMR)
 * Covers: All 9 DOT hazmat classes
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const hazmatClasses = [
  // Class 1: Explosives
  {
    class_number: "1.1",
    class_name: "Mass Explosion Hazard",
    division: "1",
    description: "Mass explosion hazard. Division 1.1 explosives have a mass explosion hazard which affects the entire load instantaneously.",
    key_requirements: [
      "Must be transported by authorized carrier with HM endorsement",
      "Driver must have HM training per 49 CFR 172.700",
      "Placarding required per 49 CFR 172.500",
      "Shipping papers must accompany shipment",
      "Compatibility requirements must be met per 49 CFR 177"
    ],
    marking_requirements: [
      "EX number assigned by DOT (e.g., UN0481)",
      "Division 1.1 placard required",
      "Explosives placard in addition to any subsidiary hazard"
    ],
    labeling_requirements: [
      "Division 1.1 EXPLOSIVES label (orange)"
    ],
    placard_requirements: [
      "EXPLOSIVES 1.1 (orange)"
    ],
    training_requirements: "Drivers must receive hazmat training covering all 7 general topics per 49 CFR 172.700 including: general awareness, function-specific, safety, security, and in some cases multimodal training.",
    citation: "49 CFR Parts 100-185; 172 Subparts D, E, F"
  },
  {
    class_number: "1.4",
    class_name: "No Mass Explosion Hazard",
    division: "1",
    description: "Explosives with no mass explosion hazard. Division 1.4 explosives present a fire or projection hazard but not mass explosion.",
    key_requirements: [
      "Less restrictive than Division 1.1",
      "Still requires HM endorsement and training",
      "Shipping papers required"
    ],
    marking_requirements: ["Compatibility class letter required", "UN number marking"],
    labeling_requirements: ["Division 1.4 EXPLOSIVES label"],
    placard_requirements: ["EXPLOSIVES 1.4 (orange) if in quantities requiring placard"],
    training_requirements: "Same as Division 1.1 - full hazmat training required.",
    citation: "49 CFR 172.400; 172.500"
  },

  // Class 2: Gases
  {
    class_number: "2.1",
    class_name: "Flammable Gas",
    description: "Gases which ignite on contact with an ignition source. Includes propane, butane, methane, hydrogen.",
    key_requirements: [
      "Non-bulk packaging: Mark with UN number on each package",
      "Bulk packaging: DOT specification cylinder or tank required",
      "Driver HM endorsement required",
      "No smoking within 25 feet of vehicle carrying FLAMMable GAS"
    ],
    marking_requirements: [
      "UN number (e.g., UN1075 for LPG)",
      "FLAMMABLE GAS placard on transport vehicle"
    ],
    labeling_requirements: ["FLAMMABLE GAS label (red diamond with 'FLAMMABLE GAS')"],
    placard_requirements: ["FLAMMABLE GAS placard (red diamond)"],
    training_requirements: "Full hazmat training required for any driver transporting Division 2.1.",
    citation: "49 CFR 172.101; 172.400; 177.800"
  },
  {
    class_number: "2.2",
    class_name: "Non-Flammable Non-Toxic Gas",
    description: "Non-flammable, non-toxic gases including nitrogen, oxygen, argon, helium, and CO2.",
    key_requirements: [
      "Compressed gas cylinders must meet DOT specification",
      "Oxygen shipments require special handling (no oil/grease on fittings)",
      "Transport vehicles must be properly ventilated"
    ],
    marking_requirements: ["UN number on each package", "NON-FLAMMABLE GAS placard"],
    labeling_requirements: ["NON-FLAMMABLE GAS label (green diamond with 'NON-FLAMMABLE GAS')"],
    placard_requirements: ["NON-FLAMMABLE GAS placard (green)"],
    training_requirements: "General hazmat awareness training required.",
    citation: "49 CFR 172.101; 173.302"
  },
  {
    class_number: "2.3",
    class_name: "Toxic Gas",
    description: "Gases known to be toxic to humans. Includes chlorine, ammonia (anhydrous), fluorine, hydrogen cyanide.",
    key_requirements: [
      "Toxic gas placard required",
      "Inhalation hazard label required when applicable",
      "Shipping papers must note 'TOXIC BY INHALATION' if applicable",
      "Specific quantity limitations may apply",
      "Driver HM endorsement required"
    ],
    marking_requirements: ["UN number", "TOXIC GAS placard", "INHALATION HAZARD marking when applicable"],
    labeling_requirements: ["TOXIC GAS label (white diamond)", "Poison Inhalation Hazard label (widow) when applicable"],
    placard_requirements: ["TOXIC GAS placard (white)", "POISON INHALATION HAZARD placard when applicable"],
    training_requirements: "Full hazmat training including toxic gas specifics required. Function-specific training on toxic gas properties essential.",
    citation: "49 CFR 172.101; 173.300; 177.800"
  },

  // Class 3: Flammable Liquids
  {
    class_number: "3",
    class_name: "Flammable Liquid",
    description: "Flammable liquids with a flash point below 141°F (60.5°C). Includes gasoline, diesel fuel, acetone, methanol, paints, lacquers.",
    packing_group: "III",
    description: "Flammable liquids PG III have flash point 73-141°F. Lower flash point = higher danger. Diesel fuel (flash point ~140°F) is PG III. Gasoline (flash point ~-45°F) is PG I.",
    key_requirements: [
      "PG I (flash point below 73°F): most restrictive packaging",
      "PG II (73-100°F): intermediate packaging",
      "PG III (100-141°F): least restrictive, still regulated",
      "Driver HM endorsement required for bulk shipments",
      "No smoking within 25 feet of vehicle"
    ],
    marking_requirements: ["UN number on each package", "Flash point statement may be required"],
    labeling_requirements: ["FLAMMABLE LIQUID label (red with 'FLAMMABLE LIQUID')"],
    placard_requirements: ["FLAMMABLE placard (red)"],
    training_requirements: "Full hazmat training required. Function-specific training on flammable liquid properties required.",
    citation: "49 CFR 172.101; 173.120; 177.800"
  },

  // Class 4: Flammable Solids
  {
    class_number: "4.1",
    class_name: "Flammable Solid",
    description: "Flammable solids including magnesium, sodium, sulfur, some plastics, and substances that can cause fire through friction.",
    key_requirements: [
      "Must be protected against ignition and fire",
      "Not to be stored near flammable materials",
      "Driver HM endorsement required"
    ],
    marking_requirements: ["UN number", "FLAMMABLE SOLID placard"],
    labeling_requirements: ["FLAMMABLE SOLID label (red/white stripes with 'FLAMMABLE SOLID')"],
    placard_requirements: ["FLAMMABLE SOLID placard (red/white stripes)"],
    training_requirements: "Full hazmat training required.",
    citation: "49 CFR 172.400; 174.800"
  },
  {
    class_number: "4.3",
    class_name: "Dangerous When Wet",
    description: "Substances that emit flammable gases when wet. Includes sodium, potassium, calcium carbide, lithium.",
    key_requirements: [
      "Must be kept dry at all times",
      "Special packaging to prevent water ingress",
      "Driver HM endorsement required"
    ],
    marking_requirements: ["UN number", "DANGEROUS WHEN WET placard"],
    labeling_requirements: ["FLAMMABLE SOLID label with 'DANGEROUS WHEN WET' notation"],
    placard_requirements: ["DANGEROUS WHEN WET placard (blue)"],
    training_requirements: "Full hazmat training including water-reactive properties required.",
    citation: "49 CFR 172.400; 173.150"
  },

  // Class 5: Oxidizers
  {
    class_number: "5.1",
    class_name: "Oxidizer",
    description: "Oxidizing substances that can cause or enhance combustion. Includes hydrogen peroxide (>8%), nitrates, perchlorates.",
    key_requirements: [
      "Must be separated from flammable materials",
      "Segregation requirements in transport vehicle",
      "Driver HM endorsement required for higher concentrations"
    ],
    marking_requirements: ["UN number", "OXIDIZER placard"],
    labeling_requirements: ["OXIDIZER label (yellow with 'OXIDIZER')"],
    placard_requirements: ["OXIDIZER placard (yellow diamond)"],
    training_requirements: "Full hazmat training required. Function-specific training on oxidizer hazards essential.",
    citation: "49 CFR 172.400; 173.150"
  },
  {
    class_number: "5.2",
    class_name: "Organic Peroxide",
    description: "Organic peroxide compounds that are thermally unstable. Includes benzoyl peroxide, hydrogen peroxide >52%. Highly reactive.",
    key_requirements: [
      "Temperature control may be required for some organic peroxides",
      "Must be kept away from heat and open flames",
      "Special packaging per 49 CFR 173.225"
    ],
    marking_requirements: ["UN number", "ORGANIC PEROXIDE placard"],
    labeling_requirements: ["ORGANIC PEROXIDE label (yellow/red"],
    training_requirements: "Full hazmat training required. Temperature sensitivity requires additional training on handling and emergency response.",
    citation: "49 CFR 172.400; 173.225"
  },

  // Class 6: Toxic / Poison
  {
    class_number: "6.1",
    class_name: "Toxic / Poison",
    description: "Toxic substances other than gases. Includes pesticides, certain medications, arsenic compounds, cyanide compounds.",
    packing_group: "III",
    description: "PG I: Lethal dose <50mg/kg. PG II: LD50 <300mg/kg. PG III: LD50 <2000mg/kg. Most consumer pesticides are PG III.",
    key_requirements: [
      "POISON labeling required",
      "Inhalation hazard notation when applicable (PG I toxic by inhalation)",
      "Driver HM endorsement required for PG I and II"
    ],
    marking_requirements: ["UN number", "POISON/TOXIC placard", "Inhalation hazard marking when applicable"],
    labeling_requirements: ["POISON label (white diamond with skull/crossbones)"],
    placard_requirements: ["POISON placard (white)", "POISON INHALATION HAZARD placard when applicable"],
    training_requirements: "Full hazmat training required. Pesticide-specific training may be required under EPA regulations.",
    citation: "49 CFR 172.400; 173.130"
  },

  // Class 7: Radioactive
  {
    class_number: "7",
    class_name: "Radioactive Material",
    description: "Radioactive materials including uranium, plutonium, cesium-137, cobalt-60, medical isotopes. Class 7 is uniquely regulated by NRC and DOT.",
    key_requirements: [
      "Radioactive materials require special packaging (Type A or Type B)",
      "Each package must have RADIOACTIVE placard",
      "Transport index and criticality safety index must be marked",
      "Driver HM endorsement and special training required",
      "Limited to specific routes and times in some areas"
    ],
    marking_requirements: ["UN number", "RADIOACTIVE placard", "Transport Index (TI) display", "Criticality Safety Index (CSI) when applicable"],
    labeling_requirements: ["RADIOACTIVE I, II, or III label (yellow/white with radioactivity symbol)"],
    placard_requirements: ["RADIOACTIVE placard (yellow/white)"],
    training_requirements: "Full hazmat training plus function-specific radioactive materials training required per 49 CFR 172.700.",
    citation: "49 CFR Parts 171-173; 10 CFR Part 71"
  },

  // Class 8: Corrosive
  {
    class_number: "8",
    class_name: "Corrosive",
    description: "Liquids or solids that cause visible destruction or irreversible alterations in human skin tissue. Includes sulfuric acid, hydrochloric acid, sodium hydroxide, battery acid.",
    packing_group: "III",
    description: "PG I (severe): destroys skin in <1 hour. PG II (less severe): destroys skin in <4 hours. PG III (slight): affects skin in <8 hours but is observable.",
    key_requirements: [
      "Corrosive placard on transport vehicle",
      "Must not be stacked above other cargo",
      "Must be protected from freezing (for some acids)",
      "Driver HM endorsement required for bulk"
    ],
    marking_requirements: ["UN number on each package", "CORROSIVE placard"],
    labeling_requirements: ["CORROSIVE label (black/white with 'CORROSIVE' and flask icon)"],
    placard_requirements: ["CORROSIVE placard (black/white diamond)"],
    training_requirements: "Full hazmat training required. Function-specific training on corrosive properties required.",
    citation: "49 CFR 172.400; 173.136"
  },

  // Class 9: Miscellaneous
  {
    class_number: "9",
    class_name: "Miscellaneous Dangerous Goods",
    description: "Materials which present a hazard during transport but do not meet the definition of any other class. Includes dry ice, asbestos, lithium batteries, vehicle/aircraft parts with残 fuel.",
    key_requirements: [
      "Class 9 has lowest regulatory threshold for most materials",
      "Lithium batteries have specific requirements per 49 CFR 173.185",
      "Dry ice (solid CO2) requires ventilation notation on shipping papers"
    ],
    marking_requirements: ["UN number", "CLASS 9 placard (gray/white with 'CLASS 9')"],
    labeling_requirements: ["CLASS 9 label (gray/white with 'MISCELLANEOUS DANGEROUS GOODS')"],
    placard_requirements: ["CLASS 9 placard (gray/white diamond)"],
    training_requirements: "General hazmat awareness training required. Lithium battery-specific training when applicable.",
    citation: "49 CFR 172.400; 173.185 (lithium batteries)"
  }
];

async function main() {
  console.log("Seeding DOT Hazardous Materials classifications...\n");

  for (const hm of hazmatClasses) {
    const { error } = await supabase
      .from("hazmat_classifications")
      .upsert(hm, { onConflict: "class_number" });

    if (error) {
      console.log(`  SKIP  Class ${hm.class_number}: ${error.message}`);
    } else {
      console.log(`  OK    Class ${hm.class_number}: ${hm.class_name}`);
    }
  }

  console.log(`\nDone: ${hazmatClasses.length} hazmat classifications seeded`);
  console.log("Reference: 49 CFR Parts 100-185 (Hazardous Materials Regulations)");
}

main().catch(console.error);
