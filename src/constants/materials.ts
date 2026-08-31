export const IS_STEEL_GRADES: Record<string, { fy: number; fu: number; default?: boolean }> = {
  'E250 (Fe410)': { fy: 250, fu: 410, default: true },
  'E300 (Fe440)': { fy: 300, fu: 440 },
  'E350 (Fe490)': { fy: 350, fu: 490 },
  'E410 (Fe540)': { fy: 410, fu: 540 },
  'E450 (Fe570)': { fy: 450, fu: 570 },
  'E550 (Fe670)': { fy: 550, fu: 670 },
};

export const AISC_STEEL_GRADES: Record<string, { fy: number; fu: number; default?: boolean; defaultPlate?: boolean; defaultWF?: boolean }> = {
  'A36':        { fy: 248.2, fu: 400.0, defaultPlate: true },
  'A572-Gr50':  { fy: 344.7, fu: 448.2 },
  'A992':       { fy: 344.7, fu: 448.2, defaultWF: true },
  'A500-GrB':   { fy: 317.2, fu: 400.0 },
  'A500-GrC':   { fy: 344.7, fu: 427.5 },
  'A53-GrB':    { fy: 241.3, fu: 413.7 },
};

export const IS_ANCHOR_GRADES: Record<string, { fy: number; fu: number; sizes: number[]; default?: boolean }> = {
  'IS 1367 Class 4.6': { fy: 240, fu: 400, sizes: [12,16,20,24,30,36,42,48] },
  'IS 1367 Class 5.6': { fy: 300, fu: 500, sizes: [16,20,24,30,36] },
  'IS 1367 Class 8.8': { fy: 640, fu: 800, sizes: [16,20,24,30,36,42,48], default: true },
  'IS 1367 Class 10.9': { fy: 900, fu: 1000, sizes: [16,20,24,30,36] },
  'SS304 IS 3757': { fy: 210, fu: 500, sizes: [12,16,20,24,30,36] },
  'SS316 IS 3757': { fy: 210, fu: 500, sizes: [12,16,20,24,30,36] },
};

export const ASTM_ANCHOR_GRADES: Record<string, { fy: number; fu: number; sizes: number[]; default?: boolean }> = {
  'ASTM F1554 Gr.36':  { fy: 248.2, fu: 400.0, sizes: [16,19,22,25,32,38,44,51,57,64,76] },
  'ASTM F1554 Gr.55':  { fy: 379.2, fu: 517.1, sizes: [16,19,22,25,32,38,44,51], default: true },
  'ASTM F1554 Gr.105': { fy: 723.9, fu: 861.9, sizes: [19,22,25,32,38,44,51] },
  'ASTM A307':         { fy: 248.2, fu: 413.7, sizes: [13,16,19,22,25,32,38,44,51,57,64] },
  'ASTM A325':         { fy: 634.7, fu: 827.4, sizes: [13,16,19,22,25,32,38] },
  'ASTM A490':         { fy: 896.4, fu: 1034.2, sizes: [13,16,19,22,25,32,38] },
};

export const IS_CONCRETE_GRADES: Record<string, { fck: number }> = {
  'M20': { fck: 20 },
  'M25': { fck: 25 },
  'M30': { fck: 30 },
  'M35': { fck: 35 },
  'M40': { fck: 40 },
  'M45': { fck: 45 },
  'M50': { fck: 50 },
};

export const ACI_CONCRETE_GRADES: Record<string, { fck: number }> = {
  '3000 psi (20.7 MPa)': { fck: 20.7 },
  '4000 psi (27.6 MPa)': { fck: 27.6 },
  '5000 psi (34.5 MPa)': { fck: 34.5 },
  '6000 psi (41.4 MPa)': { fck: 41.4 },
  '8000 psi (55.2 MPa)': { fck: 55.2 },
  '10000 psi (69.0 MPa)': { fck: 69.0 },
};

export const WELD_ELECTRODES: Record<string, { fu: number; code: string[] }> = {
  'E70XX (480 MPa)': { fu: 480, code: ['AISC_LRFD', 'AISC_ASD'] },
  'E60XX (415 MPa)': { fu: 415, code: ['AISC_LRFD', 'AISC_ASD'] },
  'E41XX (410 MPa)': { fu: 410, code: ['IS800'] },
  'E51XX (510 MPa)': { fu: 510, code: ['IS800'] },
};

export const COLUMN_TYPES = {
  IS800: ['ISMB', 'ISHB', 'ISMC', 'SHS', 'RHS', 'CHS', 'Built-up'],
  AISC_LRFD: ['W-Shape', 'HSS Square', 'HSS Rectangular', 'HSS Circular/Pipe', 'Built-up'],
  AISC_ASD: ['W-Shape', 'HSS Square', 'HSS Rectangular', 'HSS Circular/Pipe', 'Built-up'],
};
