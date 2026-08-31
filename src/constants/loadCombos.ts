import type { LoadCombo } from '../types';

export const ASCE7_LRFD_COMBOS: LoadCombo[] = [
  { id: 'C1', name: 'Combo 1', formula: '1.4D', D: 1.4, L: 0, W: 0, E: 0, S: 0 },
  { id: 'C2', name: 'Combo 2', formula: '1.2D + 1.6L', D: 1.2, L: 1.6, W: 0, E: 0, S: 0 },
  { id: 'C3', name: 'Combo 3', formula: '1.2D + 1.6L + 0.5W', D: 1.2, L: 1.6, W: 0.5, E: 0, S: 0 },
  { id: 'C4', name: 'Combo 4', formula: '1.2D + 1.0W + L', D: 1.2, L: 1.0, W: 1.0, E: 0, S: 0 },
  { id: 'C5', name: 'Combo 5 (Uplift)', formula: '0.9D + 1.0W', D: 0.9, L: 0, W: 1.0, E: 0, S: 0 },
  { id: 'C6', name: 'Combo 6', formula: '1.2D + 1.0E + L', D: 1.2, L: 1.0, W: 0, E: 1.0, S: 0 },
  { id: 'C7', name: 'Combo 7 (Seismic Uplift)', formula: '0.9D + 1.0E', D: 0.9, L: 0, W: 0, E: 1.0, S: 0 },
];

export const ASCE7_ASD_COMBOS: LoadCombo[] = [
  { id: 'S1', name: 'Service 1', formula: 'D', D: 1.0, L: 0, W: 0, E: 0, S: 0 },
  { id: 'S2', name: 'Service 2', formula: 'D + L', D: 1.0, L: 1.0, W: 0, E: 0, S: 0 },
  { id: 'S3', name: 'Service 3', formula: 'D + 0.75L + 0.75S', D: 1.0, L: 0.75, W: 0, E: 0, S: 0.75 },
  { id: 'S4', name: 'Service 4', formula: 'D + 0.6W', D: 1.0, L: 0, W: 0.6, E: 0, S: 0 },
  { id: 'S5', name: 'Service 5', formula: 'D + 0.75L + 0.75(0.6W)', D: 1.0, L: 0.75, W: 0.45, E: 0, S: 0 },
  { id: 'S6', name: 'Service 6 (Uplift)', formula: '0.6D + 0.6W', D: 0.6, L: 0, W: 0.6, E: 0, S: 0 },
  { id: 'S7', name: 'Service 7 (Seismic)', formula: '0.6D + 0.7E', D: 0.6, L: 0, W: 0, E: 0.7, S: 0 },
];

export const IS875_COMBOS: LoadCombo[] = [
  { id: 'IS1', name: 'IS Combo 1', formula: '1.5(DL + IL)', D: 1.5, L: 1.5, W: 0, E: 0, S: 0 },
  { id: 'IS2', name: 'IS Combo 2', formula: '1.5(DL + WL)', D: 1.5, L: 0, W: 1.5, E: 0, S: 0 },
  { id: 'IS3', name: 'IS Combo 3', formula: '1.2(DL + IL + WL)', D: 1.2, L: 1.2, W: 1.2, E: 0, S: 0 },
  { id: 'IS4', name: 'IS Combo 4 (Uplift)', formula: '0.9DL + 1.5WL', D: 0.9, L: 0, W: 1.5, E: 0, S: 0 },
  { id: 'IS5', name: 'IS Combo 5 (Seismic)', formula: '1.2(DL + IL + EL)', D: 1.2, L: 1.2, W: 0, E: 1.2, S: 0 },
  { id: 'IS6', name: 'IS Combo 6 (Seis Uplift)', formula: '0.9DL + 1.5EL', D: 0.9, L: 0, W: 0, E: 1.5, S: 0 },
];

export function getCombosForCode(code: string, loadType: string): LoadCombo[] {
  if (code === 'IS800') return IS875_COMBOS;
  if (loadType === 'SERVICE') return ASCE7_ASD_COMBOS;
  return ASCE7_LRFD_COMBOS;
}
