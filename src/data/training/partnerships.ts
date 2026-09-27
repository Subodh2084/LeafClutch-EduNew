import type { Partnership } from "@/types/training";

// MOCK partners for layout only. These are fictional organisations — replace
// them with real, approved partners (and their logos) from Supabase before
// launch. No `website` is set because none of these exist.
export const partnerships: Partnership[] = [
  // Corporate
  { id: "p-c-1", name: "Himalayan Digital Solutions", type: "corporate", display_order: 1, is_active: true },
  { id: "p-c-2", name: "TechBridge Nepal", type: "corporate", display_order: 2, is_active: true },
  { id: "p-c-3", name: "Everest Fintech Group", type: "corporate", display_order: 3, is_active: true },
  { id: "p-c-4", name: "Summit Logistics", type: "corporate", display_order: 4, is_active: true },
  { id: "p-c-5", name: "Annapurna Retail Co.", type: "corporate", display_order: 5, is_active: true },
  { id: "p-c-6", name: "Koshi Energy Services", type: "corporate", display_order: 6, is_active: true },
  { id: "p-c-7", name: "Bagmati Insurance Partners", type: "corporate", display_order: 7, is_active: true },
  { id: "p-c-8", name: "Lumbini Health Network", type: "corporate", display_order: 8, is_active: true },

  // Academic
  { id: "p-a-1", name: "Future Skills Academy", type: "academic", display_order: 1, is_active: true },
  { id: "p-a-2", name: "Valley Institute of Technology", type: "academic", display_order: 2, is_active: true },
  { id: "p-a-3", name: "Himalaya College of Computing", type: "academic", display_order: 3, is_active: true },
  { id: "p-a-4", name: "Fewa Engineering Campus", type: "academic", display_order: 4, is_active: true },
  { id: "p-a-5", name: "Greenfield Management College", type: "academic", display_order: 5, is_active: true },
  { id: "p-a-6", name: "Terai Science Campus", type: "academic", display_order: 6, is_active: true },
  { id: "p-a-7", name: "Riverside Higher Secondary School", type: "academic", display_order: 7, is_active: true },
  { id: "p-a-8", name: "Mountview IT College", type: "academic", display_order: 8, is_active: true },

  // Government
  { id: "p-g-1", name: "Digital Innovation Center", type: "government", display_order: 1, is_active: true },
  { id: "p-g-2", name: "Provincial IT Training Centre", type: "government", display_order: 2, is_active: true },
  { id: "p-g-3", name: "Municipal e-Governance Unit", type: "government", display_order: 3, is_active: true },
  { id: "p-g-4", name: "Public Service Skills Institute", type: "government", display_order: 4, is_active: true },
  { id: "p-g-5", name: "Rural Digital Literacy Program", type: "government", display_order: 5, is_active: true },
  { id: "p-g-6", name: "Local Government Data Office", type: "government", display_order: 6, is_active: true },
  { id: "p-g-7", name: "Civil Records Modernisation Project", type: "government", display_order: 7, is_active: true },
  { id: "p-g-8", name: "Community Library Network", type: "government", display_order: 8, is_active: true },
];
