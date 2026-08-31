import type { DesignInputs, CalculationResults, CheckResult, CheckStatus, DesignWarning } from '../types';

// ============================================================
// Unit helpers — all calcs run in N, mm, MPa
// ============================================================
const kN = (v: number) => v * 1000;
const kNm = (v: number) => v * 1_000_000;

function statusRank(s: CheckStatus): number {
  return { PASS: 0, INFO: 1, CAUTION: 2, WARNING: 3, CRITICAL: 4, REDESIGN: 5 }[s] ?? 0;
}

// ============================================================
// MODULE 05 — Load Classification & Eccentricity
// ============================================================
function classifyLoads(inp: DesignInputs): CheckResult {
  const P_N = kN(inp.P);
  const Mx_Nmm = kNm(inp.Mx);
  const My_Nmm = kNm(inp.My);
  const warnings: DesignWarning[] = [];

  let condition: string;
  let ex = 0, ey = 0;

  if (Math.abs(P_N) < 1) {
    condition = 'SHEAR_DOMINANT';
    warnings.push({ level: 2, msg: 'Axial load is zero. Shear-dominant case. Verify anchor shear capacity governs.', clause: 'AISC DG1 / IS 800:2007 Cl.7.4' });
  } else if (P_N < 0) {
    condition = 'UPLIFT';
    ex = Math.abs(Mx_Nmm / P_N);
    ey = Math.abs(My_Nmm / P_N);
    warnings.push({ level: 4, msg: 'Uplift (tension) detected. Anchor tension design governs. Full ACI 318-19 Ch.17 checks required.', clause: 'ACI 318-19 Ch.17 / IS 800:2007 Cl.7.4.3' });
  } else {
    condition = 'COMPRESSION';
    ex = Mx_Nmm / P_N;
    ey = My_Nmm / P_N;
  }

  const kern_x = inp.plate_N / 6;
  const kern_y = inp.plate_B / 6;
  const fullComp = Math.abs(ex) <= kern_x && Math.abs(ey) <= kern_y;
  const anchorTensionReq = condition === 'UPLIFT' || !fullComp;

  if (!fullComp && condition === 'COMPRESSION') {
    warnings.push({
      level: 3,
      msg: `Eccentricity ex=${ex.toFixed(1)} mm exceeds kern N/6=${kern_x.toFixed(1)} mm. Partial uplift — anchor tension required.`,
      clause: 'AISC DG1 Sec.3.2 / IS 800:2007 Cl.7.4.3',
    });
  }

  const status: CheckStatus = condition === 'UPLIFT' ? 'WARNING' : (!fullComp ? 'WARNING' : 'PASS');

  return {
    formula: 'ex = Mx/P  |  ey = My/P  |  kern = N/6, B/6',
    clause: 'AISC DG1 Eq.3.1 / IS 800:2007 Cl.7.4.1',
    intermediate: { ex_mm: +ex.toFixed(2), ey_mm: +ey.toFixed(2), kern_x_mm: +kern_x.toFixed(2), kern_y_mm: +kern_y.toFixed(2), 'ex/kern': +(Math.abs(ex)/kern_x).toFixed(3) },
    result: { condition, full_compression: fullComp, anchor_tension_required: anchorTensionReq },
    status, warnings,
  };
}

// ============================================================
// MODULE 06 — Plate Geometry & Bearing Areas
// ============================================================
function calcGeometry(inp: DesignInputs): CheckResult {
  const proj = 50; // mm
  const N_min = inp.col_d + 2 * proj;
  const B_min = inp.col_bf + 2 * proj;
  const A1 = inp.plate_N * inp.plate_B;
  const pedL = inp.supportType === 'PEDESTAL' ? inp.ped_L : inp.plate_N * 2;
  const pedB = inp.supportType === 'PEDESTAL' ? inp.ped_B : inp.plate_B * 2;
  const A2 = pedL * pedB;
  const CF_raw = Math.sqrt(A2 / A1);
  const CF = Math.min(CF_raw, 2.0);
  const warnings: DesignWarning[] = [];

  if (inp.plate_N < N_min) {
    warnings.push({ level: 3, msg: `Plate length N=${inp.plate_N} mm < N_min=${N_min.toFixed(0)} mm. Plate NOT auto-adjusted. Please revise.`, clause: 'AISC DG1 Eq.2.1 / IS 800 Cl.7.4.1', fix: `Increase plate N to at least ${Math.ceil(N_min/5)*5} mm` });
  }
  if (inp.plate_B < B_min) {
    warnings.push({ level: 3, msg: `Plate width B=${inp.plate_B} mm < B_min=${B_min.toFixed(0)} mm. Plate NOT auto-adjusted. Please revise.`, clause: 'AISC DG1 Eq.2.1 / IS 800 Cl.7.4.1', fix: `Increase plate B to at least ${Math.ceil(B_min/5)*5} mm` });
  }
  if (inp.supportType === 'PEDESTAL' && (inp.ped_L < inp.plate_N || inp.ped_B < inp.plate_B)) {
    warnings.push({ level: 4, msg: `Pedestal (${inp.ped_L}×${inp.ped_B} mm) < plate (${inp.plate_N}×${inp.plate_B} mm). Edge distance critically low.`, clause: 'ACI 318-19 17.5.2 / IS 5624', fix: 'Increase pedestal plan size to exceed plate by ≥100 mm each side' });
  }

  const sizeOk = inp.plate_N >= N_min && inp.plate_B >= B_min;
  return {
    formula: 'N_min = d + 2×50  |  B_min = bf + 2×50  |  A1 = N×B  |  CF = min(√(A2/A1), 2.0)',
    clause: 'AISC DG1 Eq.2.1 / AISC 360-22 J8.1 / IS 456 Cl.34.4',
    intermediate: { N_min_mm: +N_min.toFixed(0), B_min_mm: +B_min.toFixed(0), A1_mm2: +A1.toFixed(0), A2_mm2: +A2.toFixed(0), 'A2/A1': +(A2/A1).toFixed(3), CF_raw: +CF_raw.toFixed(4), CF_limited: +CF.toFixed(4) },
    result: { N_min_mm: N_min, B_min_mm: B_min, A1_mm2: A1, A2_mm2: A2, CF, size_ok: sizeOk },
    status: sizeOk ? 'PASS' : 'WARNING',
    warnings,
  };
}

// ============================================================
// MODULE 07 — Bearing Pressure Distribution
// ============================================================
function calcPressure(inp: DesignInputs, A1: number): CheckResult {
  const P_N = kN(inp.P);
  const Mx_Nmm = kNm(inp.Mx);
  const Z = (inp.plate_B * inp.plate_N ** 2) / 6;
  const fp_avg = P_N / A1;
  const fp_max = fp_avg + Mx_Nmm / Z;
  const fp_min = fp_avg - Mx_Nmm / Z;
  const fullComp = fp_min >= 0;
  const warnings: DesignWarning[] = [];

  if (!fullComp) {
    warnings.push({ level: 3, msg: `fp_min = ${fp_min.toFixed(3)} MPa < 0. Partial bearing — anchor tension required.`, clause: 'AISC DG1 Sec.3.2 / IS 800 Cl.7.4.3' });
  }

  return {
    formula: 'fp_avg = P/A1  |  fp_max = P/A1 + Mx/Z  |  Z = B×N²/6',
    clause: 'AISC DG1 Sec.3.1 / IS 800 Cl.7.4.1',
    intermediate: { Z_mm3: +Z.toFixed(0), fp_avg_MPa: +fp_avg.toFixed(4), P_kN: inp.P, Mx_kNm: inp.Mx },
    result: { fp_max_MPa: +fp_max.toFixed(4), fp_min_MPa: +fp_min.toFixed(4), fp_avg_MPa: +fp_avg.toFixed(4), full_compression: fullComp },
    status: fullComp ? 'PASS' : 'WARNING',
    warnings,
  };
}

// ============================================================
// MODULE 08 — Concrete Bearing Check
// ============================================================
function checkBearing(inp: DesignInputs, A1: number, CF: number, fp_max: number): CheckResult {
  const P_N = kN(inp.P);
  const warnings: DesignWarning[] = [];
  let utilization: number;
  let formula: string, clause: string;
  const intermediate: Record<string, number | string | boolean> = {};

  const CF_used = inp.supportType === 'SLAB' ? Math.min(CF, 1.0) : CF;

  if (inp.code === 'IS800') {
    const fp_allow = 0.45 * inp.fck * CF_used;
    utilization = fp_max / fp_allow;
    formula = 'fp_allow = 0.45 × fck × CF';
    clause = 'IS 456:2000 Cl.34.4 / IS 800:2007 Cl.7.4.1';
    Object.assign(intermediate, { fck_mpa: inp.fck, CF_used: +CF_used.toFixed(4), fp_allow_MPa: +fp_allow.toFixed(4), fp_actual_MPa: +fp_max.toFixed(4) });
  } else {
    const phi_c = 0.65;
    const phi_Pp = phi_c * 0.85 * inp.fck * A1 * CF_used;
    utilization = Math.abs(P_N) / phi_Pp;
    formula = "φPp = φc × 0.85 × f'c × A1 × CF";
    clause = 'AISC 360-22 Section J8.1';
    Object.assign(intermediate, { phi_c, fc_prime_mpa: inp.fck, A1_mm2: +A1.toFixed(0), CF_used: +CF_used.toFixed(4), phi_Pp_N: +phi_Pp.toFixed(0), Pu_N: +P_N.toFixed(0) });
  }

  if (utilization > 1.0) {
    warnings.push({ level: 5, msg: `REDESIGN: Bearing utilisation = ${utilization.toFixed(3)} > 1.0. Increase plate area or pedestal.`, clause, fix: "Increase N × B or use higher f'c" });
  } else if (utilization > 0.90) {
    warnings.push({ level: 3, msg: `Bearing utilisation ${utilization.toFixed(3)} > 0.90. Close to limit.`, clause });
  }

  const status: CheckStatus = utilization > 1 ? 'REDESIGN' : (utilization > 0.90 ? 'WARNING' : 'PASS');
  return {
    formula, clause, intermediate,
    result: { utilization: +utilization.toFixed(4), support_type: inp.supportType, safe: utilization <= 1 },
    status, warnings,
  };
}

// ============================================================
// MODULE 09 — Plate Thickness
// ============================================================
function calcPlateThickness(inp: DesignInputs, fp_max: number, A1: number): CheckResult {
  const m = (inp.plate_N - 0.95 * inp.col_d) / 2;
  const n = (inp.plate_B - 0.80 * inp.col_bf) / 2;
  const n_prime = Math.sqrt(inp.col_d * inp.col_bf) / 4;
  const l_crit = Math.max(m, n, n_prime, 1);
  const warnings: DesignWarning[] = [];
  let tp_req: number, formula: string, clause: string;

  if (inp.code === 'IS800') {
    const gamma_m0 = 1.10;
    const Md = fp_max * (l_crit ** 2) / 2;
    tp_req = Math.sqrt(6 * Md * gamma_m0 / inp.plateFy);
    formula = 'tp = √(6 × Md × γm0 / Fy)   |   Md = fp × l²/2';
    clause = 'IS 800:2007 Cl.7.4.3';
  } else {
    const phi_b = 0.90;
    const fp = kN(inp.P) / A1;
    tp_req = l_crit * Math.sqrt(2 * Math.abs(fp) / (phi_b * inp.plateFy));
    formula = "tp = l × √(2fp / φFy)   |   l = max(m, n, λn')";
    clause = 'AISC Design Guide 1 Eq.2.6';
  }

  const utilization = tp_req / inp.plate_tp;

  if (inp.plate_tp < tp_req) {
    warnings.push({ level: 5, msg: `REDESIGN: tp_provided=${inp.plate_tp} mm < tp_required=${tp_req.toFixed(1)} mm.`, clause, fix: `Increase plate thickness to at least ${Math.ceil(tp_req/2)*2} mm` });
  }
  if (tp_req > 40) {
    warnings.push({ level: 2, msg: `tp_required=${tp_req.toFixed(1)} mm > 40 mm. Stiffener plates recommended.`, clause: 'AISC DG1 Sec.2.2 / IS 800 Cl.7.4.3', fix: 'Add stiffener plates on both sides of column web or flanges' });
  }

  const status: CheckStatus = utilization > 1 ? 'REDESIGN' : (tp_req > 40 ? 'CAUTION' : 'PASS');
  return {
    formula, clause,
    intermediate: { m_mm: +m.toFixed(2), n_mm: +n.toFixed(2), n_prime_mm: +n_prime.toFixed(2), l_crit_mm: +l_crit.toFixed(2), fp_max_MPa: +fp_max.toFixed(4), tp_required_mm: +tp_req.toFixed(2) },
    result: { tp_required_mm: +tp_req.toFixed(2), tp_provided_mm: inp.plate_tp, utilization: +utilization.toFixed(4), stiffener_recommended: tp_req > 40 },
    status, warnings,
  };
}

// ============================================================
// MODULE 10 — Anchor Tension
// ============================================================
function calcAnchorTension(inp: DesignInputs): CheckResult {
  const P_N = kN(inp.P);
  const Mx_Nmm = kNm(inp.Mx);
  const uplift = P_N < 0;
  const lever_arm = 0.90 * inp.plate_N;
  const n_tension = Math.max(2, Math.floor(inp.anchorCount / 2));
  let T_total: number;

  if (uplift) {
    T_total = Math.abs(P_N) + (Math.abs(Mx_Nmm) / lever_arm);
  } else {
    T_total = Math.max(0, Math.abs(Mx_Nmm) / lever_arm - Math.abs(P_N) / 2);
  }
  const T_per = T_total / n_tension;
  const warnings: DesignWarning[] = [];

  if (T_total > 0) {
    warnings.push({ level: uplift ? 4 : 3, msg: `Anchor tension: T_total=${(T_total/1000).toFixed(1)} kN, T_per_anchor=${(T_per/1000).toFixed(1)} kN. Verify embedment.`, clause: 'AISC DG1 Sec.3.2 / IS 800 Cl.7.4.3' });
  }

  return {
    formula: 'T = |Mx|/lever_arm ± P  (uplift adds, compression subtracts)',
    clause: 'AISC DG1 Sec.3.2 / IS 800 Cl.7.4.3',
    intermediate: { lever_arm_mm: +lever_arm.toFixed(1), uplift, n_tension_anchors: n_tension },
    result: { T_total_N: +T_total.toFixed(1), T_per_anchor_N: +T_per.toFixed(1), n_tension_anchors: n_tension },
    status: T_total > 0 ? (uplift ? 'WARNING' : 'INFO') : 'PASS',
    warnings,
  };
}

// ============================================================
// MODULE 11 — Anchor Steel Capacity
// ============================================================
function checkAnchorCapacity(inp: DesignInputs, T_per_N: number): CheckResult {
  const V_total_N = kN(Math.sqrt(inp.Vx ** 2 + inp.Vy ** 2));
  const V_per_N = V_total_N / inp.anchorCount;
  const Ase = Math.PI * (0.9 * inp.anchorDia) ** 2 / 4;
  const warnings: DesignWarning[] = [];
  let t_ratio: number, v_ratio: number, formula: string, clause: string;

  if (inp.code === 'IS800') {
    const gamma_m1 = 1.25;
    const Tnd = 0.9 * inp.anchorFu * Math.PI * inp.anchorDia ** 2 / 4 / gamma_m1;
    const Vnd = inp.anchorFu * Math.PI * inp.anchorDia ** 2 / 4 / (Math.sqrt(3) * gamma_m1);
    t_ratio = T_per_N / Tnd;
    v_ratio = V_per_N / Vnd;
    formula = 'Tnd = 0.9×fu×Anc/γm1  |  Vnd = fu×Anc/(√3×γm1)  |  Interaction = (T/Tnd)²+(V/Vnd)²';
    clause = 'IS 800:2007 Cl.10.3.5, Cl.10.3.6';
  } else {
    const phi_Nsa = 0.75, phi_Vsa = 0.65;
    const phi_N = phi_Nsa * Ase * inp.anchorFu;
    const phi_V = phi_Vsa * 0.6 * Ase * inp.anchorFu;
    t_ratio = T_per_N / phi_N;
    v_ratio = V_per_N / phi_V;
    formula = 'φNsa = 0.75×Ase×fu  |  φVsa = 0.65×0.6×Ase×fu  |  (T/φNsa)^5/3+(V/φVsa)^5/3 ≤ 1.0';
    clause = 'ACI 318-19 17.5.1, 17.7.1, 17.8.3';
  }

  const interaction = inp.code === 'IS800'
    ? (t_ratio ** 2 + v_ratio ** 2)
    : ((Math.max(t_ratio,0) ** (5/3)) + (Math.max(v_ratio,0) ** (5/3)));

  if (t_ratio > 1) warnings.push({ level: 5, msg: `Anchor tension FAILS: ratio=${t_ratio.toFixed(3)} > 1.0`, clause, fix: 'Increase anchor diameter or count' });
  if (v_ratio > 1) warnings.push({ level: 5, msg: `Anchor shear FAILS: ratio=${v_ratio.toFixed(3)} > 1.0`, clause, fix: 'Increase anchor count or add shear key' });
  if (interaction > 1) warnings.push({ level: 5, msg: `Tension-shear interaction FAILS: ${interaction.toFixed(3)} > 1.0`, clause, fix: 'Increase anchor size, count, or add shear key' });

  const status: CheckStatus = (t_ratio > 1 || v_ratio > 1 || interaction > 1) ? 'REDESIGN' : (interaction > 0.85 ? 'CAUTION' : 'PASS');
  return {
    formula, clause,
    intermediate: { Ase_mm2: +Ase.toFixed(2), T_per_kN: +(T_per_N/1000).toFixed(2), V_per_kN: +(V_per_N/1000).toFixed(2), t_ratio: +t_ratio.toFixed(4), v_ratio: +v_ratio.toFixed(4) },
    result: { interaction: +interaction.toFixed(4), safe_tension: t_ratio <= 1, safe_shear: v_ratio <= 1, safe_interaction: interaction <= 1 },
    status, warnings,
  };
}

// ============================================================
// MODULE 12 — Anchor Dia vs Plate Thickness
// ============================================================
function checkAnchorDiaVsPlate(inp: DesignInputs): CheckResult {
  const ratio = inp.anchorDia / inp.plate_tp;
  const warnings: DesignWarning[] = [];
  if (ratio > 1.0) {
    warnings.push({ level: 3, msg: `Anchor dia (${inp.anchorDia} mm) > plate tp (${inp.plate_tp} mm). Prying action concern.`, clause: 'AISC DG1 Commentary / Engineering Judgment', fix: ['Increase plate tp', 'Add washer plate (t ≥ anchor dia)', 'Add stiffener plates', 'Reduce anchor diameter'] });
  } else if (ratio > 0.75) {
    warnings.push({ level: 2, msg: `Anchor dia / plate tp = ${ratio.toFixed(2)} — approaching prying limit.`, clause: 'AISC DG1 Commentary' });
  }
  return {
    formula: 'ratio = anchor_dia / plate_tp  (concern if > 1.0)',
    clause: 'AISC DG1 Commentary — NOT a code-mandated check',
    intermediate: { anchor_dia_mm: inp.anchorDia, plate_tp_mm: inp.plate_tp, ratio: +ratio.toFixed(3) },
    result: { ratio: +ratio.toFixed(3), concern: ratio > 1.0 },
    status: ratio > 1.0 ? 'WARNING' : (ratio > 0.75 ? 'CAUTION' : 'PASS'),
    warnings,
  };
}

// ============================================================
// MODULE 13 — Embedment
// ============================================================
function checkEmbedment(inp: DesignInputs, anchorTensionReq: boolean): CheckResult {
  const hef_required = anchorTensionReq ? 16 * inp.anchorDia : 12 * inp.anchorDia;
  const kc = 24.0, lam = 1.0, phi_Ncb = 0.70, psi_c = 1.25;
  const Nb = kc * lam * Math.sqrt(inp.fck) * (inp.hef ** 1.5);
  const ca_min = inp.edgeDist_x;
  const psi_ed = ca_min >= 1.5 * inp.hef ? 1.0 : (0.7 + 0.3 * ca_min / (1.5 * inp.hef));
  const phi_Ncb_N = phi_Ncb * psi_ed * psi_c * Nb;
  const warnings: DesignWarning[] = [];

  if (inp.hef < hef_required) {
    warnings.push({ level: 4, msg: `hef_provided=${inp.hef} mm < hef_required=${hef_required} mm (${anchorTensionReq?'16d':'12d'}).`, clause: 'AISC DG1 / IS 5624:1993', fix: `Increase embedment to at least ${hef_required} mm` });
  }
  if (inp.supportType === 'SLAB' && inp.hef > inp.slab_ts - 75) {
    warnings.push({ level: 4, msg: `Anchor embedment (${inp.hef} mm) + cover (75 mm) exceeds slab thickness (${inp.slab_ts} mm).`, clause: 'ACI 318-19 26.2', fix: 'Increase slab thickness or use pedestal footing' });
  }

  const utilization = inp.hef / hef_required;
  return {
    formula: 'hef_min = 12d (compression) or 16d (tension/uplift) | Nb = kc×λ×√fc×hef^1.5',
    clause: 'AISC DG1 / IS 5624:1993 / ACI 318-19 17.5.2',
    intermediate: { hef_required_mm: hef_required, kc, Nb_N: +Nb.toFixed(0), psi_ed: +psi_ed.toFixed(4), psi_c, phi_Ncb_N: +phi_Ncb_N.toFixed(0) },
    result: { hef_provided_mm: inp.hef, hef_required_mm: hef_required, utilization_hef: +utilization.toFixed(3), phi_Ncb_kN: +(phi_Ncb_N/1000).toFixed(1) },
    status: inp.hef >= hef_required ? 'PASS' : 'CRITICAL',
    warnings,
  };
}

// ============================================================
// MODULE 14 — Weld Check
// ============================================================
function checkWeld(inp: DesignInputs): CheckResult {
  const weldPerim = 2 * (inp.col_d + inp.col_bf); // approximate perimeter
  const V_total = kN(Math.sqrt(inp.Vx ** 2 + inp.Vy ** 2));
  const elec: Record<string, number> = { 'E70XX (480 MPa)': 480, 'E60XX (415 MPa)': 415, 'E41XX (410 MPa)': 410, 'E51XX (510 MPa)': 510 };
  const fu_elec = elec[inp.electrode] ?? 480;
  const warnings: DesignWarning[] = [];
  let capacity: number, formula: string, clause: string;

  if (inp.code === 'IS800') {
    const gamma_mw = 1.50;
    const throat = 0.7 * inp.weldSize;
    capacity = (fu_elec / (Math.sqrt(3) * gamma_mw)) * throat * weldPerim;
    formula = 'Capacity = (fu/√3/γmw) × throat × length  |  throat = 0.7×s';
    clause = 'IS 800:2007 Cl.10.5.7';
  } else {
    const phi_w = 0.75;
    const throat = 0.707 * inp.weldSize;
    capacity = phi_w * 0.6 * fu_elec * throat * weldPerim;
    formula = 'φRn = φ × 0.6 × Fu_elec × throat × length  |  throat = 0.707×s';
    clause = 'AISC 360-22 Section J2.4';
  }

  const utilization = V_total / capacity;
  if (utilization > 1) {
    warnings.push({ level: 5, msg: `Weld FAILS: utilisation=${utilization.toFixed(3)} > 1.0`, clause, fix: 'Increase weld size or add more weld length' });
  }

  return {
    formula, clause,
    intermediate: { weld_size_mm: inp.weldSize, weld_perimeter_mm: +weldPerim.toFixed(0), fu_electrode_mpa: fu_elec, capacity_kN: +(capacity/1000).toFixed(1), demand_kN: +(V_total/1000).toFixed(1) },
    result: { demand_kN: +(V_total/1000).toFixed(1), capacity_kN: +(capacity/1000).toFixed(1), utilization: +utilization.toFixed(4) },
    status: utilization > 1 ? 'REDESIGN' : (utilization > 0.85 ? 'CAUTION' : 'PASS'),
    warnings,
  };
}

// ============================================================
// MODULE 15 — Stiffener Check
// ============================================================
function checkStiffener(tp_req: number, inp: DesignInputs): CheckResult {
  const reasons: string[] = [];
  let required = false;
  if (tp_req > 40) { required = true; reasons.push(`tp_required = ${tp_req.toFixed(1)} mm > 40 mm`); }
  if (inp.anchorDia > inp.plate_tp) { required = true; reasons.push(`Anchor dia ${inp.anchorDia} mm > plate tp ${inp.plate_tp} mm`); }

  return {
    formula: 'Stiffener required if tp_req > 40mm OR anchor_dia > plate_tp',
    clause: 'AISC DG1 Sec.2.2 / IS 800:2007 Cl.7.4.3',
    intermediate: { tp_required_mm: +tp_req.toFixed(2), anchor_dia_mm: inp.anchorDia, plate_tp_mm: inp.plate_tp },
    result: { required, reasons: reasons.join('; ') || 'Not required', suggested_thickness_mm: required ? Math.max(10, inp.plate_tp * 0.75) : 0 },
    status: required ? 'CAUTION' : 'PASS',
    warnings: required ? [{ level: 2, msg: `Stiffener plates recommended: ${reasons.join(', ')}`, clause: 'AISC DG1 Sec.2.2', fix: 'Add 10–16 mm stiffener plates welded to column web and base plate' }] : [],
  };
}

// ============================================================
// MODULE 16 — Shear Key
// ============================================================
function checkShearKey(inp: DesignInputs, anchorShearCap: number): CheckResult {
  const V_total = kN(Math.sqrt(inp.Vx ** 2 + inp.Vy ** 2));
  const mu = 0.55;
  const V_friction = mu * Math.max(kN(inp.P), 0);
  const V_available = V_friction + anchorShearCap;
  const keyRequired = V_total > V_available;
  const V_key_needed = Math.max(0, V_total - V_available);
  const warnings: DesignWarning[] = [];

  if (keyRequired) {
    warnings.push({ level: 4, msg: `Shear key required. Vu=${(V_total/1000).toFixed(1)} kN > V_avail=${(V_available/1000).toFixed(1)} kN.`, clause: 'AISC DG1 Sec.5 / IS 800 Cl.7.4.4', fix: 'Add shear lug welded to underside of base plate, embedded in concrete' });
  }

  return {
    formula: 'V_friction = μ×P  |  V_available = V_friction + V_anchors  |  Key if Vu > V_avail',
    clause: 'AISC DG1 Sec.5 / IS 800:2007 Cl.7.4.4',
    intermediate: { mu, V_friction_kN: +(V_friction/1000).toFixed(1), V_anchors_kN: +(anchorShearCap/1000).toFixed(1), V_available_kN: +(V_available/1000).toFixed(1), Vu_kN: +(V_total/1000).toFixed(1) },
    result: { shear_key_required: keyRequired, V_key_needed_kN: +(V_key_needed/1000).toFixed(1) },
    status: keyRequired ? 'WARNING' : 'PASS',
    warnings,
  };
}

// ============================================================
// MASTER RUNNER
// ============================================================
export function runCalculations(inp: DesignInputs): CalculationResults {
  const loadCondition = classifyLoads(inp);
  const geometry = calcGeometry(inp);
  const A1 = inp.plate_N * inp.plate_B;
  const CF = (geometry.result.CF as number) ?? 1.0;
  const pressure = calcPressure(inp, A1);
  const fp_max = (pressure.result.fp_max_MPa as number) ?? 0;
  const bearing = checkBearing(inp, A1, CF, fp_max);
  const plateThickness = calcPlateThickness(inp, fp_max, A1);
  const tp_req = (plateThickness.result.tp_required_mm as number) ?? 0;
  const anchorTensionReq = loadCondition.result.anchor_tension_required as boolean;
  const anchorTension = calcAnchorTension(inp);
  const T_per = (anchorTension.result.T_per_anchor_N as number) ?? 0;
  const anchorCapacity = checkAnchorCapacity(inp, T_per);
  const anchorDiaCheck = checkAnchorDiaVsPlate(inp);
  const embedment = checkEmbedment(inp, anchorTensionReq);
  const weld = checkWeld(inp);
  const stiffener = checkStiffener(tp_req, inp);

  // Anchor shear capacity for shear key calc
  const V_anchor_cap_N = (() => {
    const Ase = Math.PI * (0.9 * inp.anchorDia) ** 2 / 4;
    return inp.code === 'IS800'
      ? inp.anchorFu * Math.PI * inp.anchorDia ** 2 / 4 / (Math.sqrt(3) * 1.25) * inp.anchorCount
      : 0.65 * 0.6 * Ase * inp.anchorFu * inp.anchorCount;
  })();

  const shearKey = checkShearKey(inp, V_anchor_cap_N);

  // Aggregate
  const allChecks = { loadCondition, geometry, pressure, bearing, plateThickness, anchorTension, anchorCapacity, anchorDiaCheck, embedment, weld, stiffener, shearKey };
  let maxRank = 0;
  const allWarnings: DesignWarning[] = [];
  for (const [key, result] of Object.entries(allChecks)) {
    const r = statusRank(result.status);
    if (r > maxRank) maxRank = r;
    for (const w of result.warnings) allWarnings.push({ ...w, module: key });
  }
  const rankToStatus: Record<number, CheckStatus> = { 0: 'PASS', 1: 'INFO', 2: 'CAUTION', 3: 'WARNING', 4: 'CRITICAL', 5: 'REDESIGN' };

  return {
    ...allChecks,
    overall: {
      status: rankToStatus[maxRank] ?? 'PASS',
      rank: maxRank,
      allWarnings: allWarnings.sort((a, b) => b.level - a.level),
      criticalCount: allWarnings.filter(w => w.level >= 4).length,
      warningCount: allWarnings.filter(w => w.level === 3).length,
      infoCount: allWarnings.filter(w => w.level <= 2).length,
    },
  };
}

export function getDefaultInputs(code: string = 'IS800'): DesignInputs {
  const isIS = code === 'IS800';
  return {
    code: code as DesignInputs['code'],
    projectName: 'Project Alpha — Column Base Plate',
    designedBy: 'Sr. Structural Engineer',
    revision: 'Rev A',
    columnGrade: isIS ? 'E250 (Fe410)' : 'A992',
    columnFy: isIS ? 250 : 344.7,
    columnFu: isIS ? 410 : 448.2,
    plateGrade: isIS ? 'E250 (Fe410)' : 'A36',
    plateFy: isIS ? 250 : 248.2,
    plateFu: isIS ? 410 : 400,
    concreteGrade: isIS ? 'M30' : '4000 psi (27.6 MPa)',
    fck: isIS ? 30 : 27.6,
    supportType: 'PEDESTAL',
    columnType: isIS ? 'ISMB' : 'W-Shape',
    sectionName: isIS ? 'ISMB 300' : 'W14x68',
    col_d: isIS ? 300 : 358,
    col_bf: isIS ? 140 : 254,
    col_tf: isIS ? 13.1 : 18.0,
    col_tw: isIS ? 7.5 : 10.5,
    plate_N: 500,
    plate_B: 400,
    plate_tp: 32,
    ped_L: 700,
    ped_B: 600,
    ped_D: 600,
    slab_ts: 250,
    edge_dist: 150,
    loadType: 'FACTORED',
    loadCombo: isIS ? 'IS Combo 1' : 'Combo 2',
    P: 800,
    Mx: 60,
    My: 0,
    Vx: 40,
    Vy: 0,
    anchorType: 'CAST_IN',
    anchorGrade: isIS ? 'IS 1367 Class 8.8' : 'ASTM F1554 Gr.55',
    anchorFy: isIS ? 640 : 379.2,
    anchorFu: isIS ? 800 : 517.1,
    anchorDia: isIS ? 24 : 25,
    anchorCount: 4,
    edgeDist_x: 100,
    edgeDist_y: 80,
    spacing_x: 300,
    spacing_y: 240,
    hef: isIS ? 350 : 380,
    weldType: 'FILLET',
    electrode: isIS ? 'E41XX (410 MPa)' : 'E70XX (480 MPa)',
    weldSize: 12,
  };
}
