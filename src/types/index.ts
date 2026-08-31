export type DesignCode = 'AISC_LRFD' | 'AISC_ASD' | 'IS800';
export type SupportType = 'PEDESTAL' | 'SLAB';
export type LoadCondition = 'COMPRESSION' | 'UPLIFT' | 'SHEAR_DOMINANT';
export type WarningLevel = 1 | 2 | 3 | 4 | 5;
export type CheckStatus = 'PASS' | 'CAUTION' | 'WARNING' | 'CRITICAL' | 'REDESIGN' | 'INFO';

export interface DesignWarning {
  level: WarningLevel;
  msg: string;
  clause?: string;
  fix?: string | string[];
  module?: string;
}

export interface CheckResult {
  formula: string;
  clause: string;
  intermediate: Record<string, number | string | boolean>;
  result: Record<string, number | string | boolean>;
  status: CheckStatus;
  warnings: DesignWarning[];
}

export interface DesignInputs {
  // Design basis
  code: DesignCode;
  projectName: string;
  designedBy: string;
  revision: string;

  // Materials
  columnGrade: string;
  columnFy: number;
  columnFu: number;
  plateGrade: string;
  plateFy: number;
  plateFu: number;
  concreteGrade: string;
  fck: number;
  supportType: SupportType;

  // Column geometry
  columnType: string;
  sectionName: string;
  col_d: number;
  col_bf: number;
  col_tf: number;
  col_tw: number;

  // Plate
  plate_N: number;
  plate_B: number;
  plate_tp: number;

  // Pedestal / Slab
  ped_L: number;
  ped_B: number;
  ped_D: number;
  slab_ts: number;
  edge_dist: number;

  // Loads
  loadType: 'FACTORED' | 'SERVICE';
  loadCombo: string;
  P: number;
  Mx: number;
  My: number;
  Vx: number;
  Vy: number;

  // Anchors
  anchorType: 'CAST_IN' | 'POST_INSTALLED';
  anchorGrade: string;
  anchorFy: number;
  anchorFu: number;
  anchorDia: number;
  anchorCount: number;
  edgeDist_x: number;
  edgeDist_y: number;
  spacing_x: number;
  spacing_y: number;
  hef: number;

  // Welds
  weldType: 'FILLET' | 'CJP' | 'PJP';
  electrode: string;
  weldSize: number;
}

export interface CalculationResults {
  loadCondition: CheckResult;
  geometry: CheckResult;
  pressure: CheckResult;
  bearing: CheckResult;
  plateThickness: CheckResult;
  anchorTension: CheckResult;
  anchorCapacity: CheckResult;
  anchorDiaCheck: CheckResult;
  embedment: CheckResult;
  weld: CheckResult;
  stiffener: CheckResult;
  shearKey: CheckResult;
  overall: {
    status: CheckStatus;
    rank: number;
    allWarnings: DesignWarning[];
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
}

export interface SectionProps {
  name: string;
  d: number;
  bf: number;
  tf: number;
  tw: number;
  Ix?: number;
  Sx?: number;
  weight: number;
  source: string;
}

export interface LoadCombo {
  id: string;
  name: string;
  formula: string;
  D: number;
  L: number;
  W: number;
  E: number;
  S: number;
}
