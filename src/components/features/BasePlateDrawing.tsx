import type { DesignInputs } from '@/types';

interface BasePlateDrawingProps {
  inputs: DesignInputs;
  view?: 'plan' | 'elevation' | 'section';
}

export default function BasePlateDrawing({ inputs, view = 'plan' }: BasePlateDrawingProps) {
  if (view === 'plan') return <PlanView inputs={inputs} />;
  if (view === 'elevation') return <ElevationView inputs={inputs} />;
  return <SectionView inputs={inputs} />;
}

function PlanView({ inputs }: { inputs: DesignInputs }) {
  const scale = 200 / Math.max(inputs.plate_N, inputs.plate_B, 200);
  const pN = inputs.plate_N * scale;
  const pB = inputs.plate_B * scale;
  const pedL = inputs.ped_L * scale;
  const pedB = inputs.ped_B * scale;
  const cx = 140, cy = 140;
  const colD = inputs.col_d * scale;
  const colBf = inputs.col_bf * scale;

  const anchorPositions = (() => {
    const ex = inputs.edgeDist_x * scale;
    const ey = inputs.edgeDist_y * scale;
    if (inputs.anchorCount === 4) {
      return [[-pN/2+ex,-pB/2+ey],[pN/2-ex,-pB/2+ey],[-pN/2+ex,pB/2-ey],[pN/2-ex,pB/2-ey]];
    }
    if (inputs.anchorCount === 6) {
      return [[-pN/2+ex,-pB/2+ey],[pN/2-ex,-pB/2+ey],[-pN/2+ex,0],[pN/2-ex,0],[-pN/2+ex,pB/2-ey],[pN/2-ex,pB/2-ey]];
    }
    const positions: [number,number][] = [];
    const n = Math.sqrt(inputs.anchorCount);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      positions.push([(-pN/2+ex) + i*(pN-2*ex)/(n-1), (-pB/2+ey) + j*(pB-2*ey)/(n-1)]);
    }
    return positions;
  })();

  return (
    <svg viewBox="0 0 280 280" className="w-full h-full" fill="none">
      {/* Title */}
      <text x="140" y="16" fill="#656D76" fontSize="9" textAnchor="middle" fontWeight="600">BASE PLATE — PLAN VIEW</text>
      <text x="140" y="26" fill="#8C959F" fontSize="7" textAnchor="middle">Scale approx. — dimensions in mm</text>

      {/* Pedestal */}
      <rect x={cx-pedL/2} y={cy-pedB/2} width={pedL} height={pedB} fill="rgba(84,174,255,0.05)" stroke="#54AEFF" strokeWidth="0.75" strokeDasharray="4 2"/>
      {/* Ped label */}
      <text x={cx+pedL/2+4} y={cy-pedB/2+8} fill="#54AEFF" fontSize="6.5">{inputs.ped_L}×{inputs.ped_B}</text>
      <text x={cx+pedL/2+4} y={cy-pedB/2+16} fill="#8C959F" fontSize="6">Pedestal</text>

      {/* Plate */}
      <rect x={cx-pN/2} y={cy-pB/2} width={pN} height={pB} fill="rgba(9,105,218,0.06)" stroke="#0969DA" strokeWidth="1.5"/>
      {/* Plate dim labels */}
      <line x1={cx-pN/2} y1={cy+pB/2+12} x2={cx+pN/2} y2={cy+pB/2+12} stroke="#656D76" strokeWidth="0.75" markerEnd="url(#arrow)"/>
      <text x={cx} y={cy+pB/2+21} fill="#656D76" fontSize="7" textAnchor="middle">{inputs.plate_N} mm (N)</text>
      <line x1={cx-pN/2-12} y1={cy-pB/2} x2={cx-pN/2-12} y2={cy+pB/2} stroke="#656D76" strokeWidth="0.75"/>
      <text x={cx-pN/2-22} y={cy+4} fill="#656D76" fontSize="7" textAnchor="middle" transform={`rotate(-90,${cx-pN/2-22},${cy})`}>{inputs.plate_B} mm (B)</text>

      {/* Column footprint */}
      <rect x={cx-colBf/2} y={cy-colD/2} width={colBf} height={colD} fill="rgba(124,58,237,0.08)" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3 2"/>
      {/* Column flanges */}
      <rect x={cx-colBf/2} y={cy-colD/2} width={colBf} height={Math.max(3, inputs.col_tf*scale)} fill="rgba(124,58,237,0.15)" stroke="#7C3AED" strokeWidth="0.75"/>
      <rect x={cx-colBf/2} y={cy+colD/2-Math.max(3,inputs.col_tf*scale)} width={colBf} height={Math.max(3, inputs.col_tf*scale)} fill="rgba(124,58,237,0.15)" stroke="#7C3AED" strokeWidth="0.75"/>
      {/* Column web */}
      <rect x={cx-Math.max(2,inputs.col_tw*scale/2)} y={cy-colD/2} width={Math.max(2, inputs.col_tw*scale)} height={colD} fill="rgba(124,58,237,0.12)" stroke="#7C3AED" strokeWidth="0.75"/>
      <text x={cx} y={cy+3} fill="#7C3AED" fontSize="6" textAnchor="middle" fontWeight="600">{inputs.sectionName}</text>

      {/* Anchor bolts */}
      {anchorPositions.map(([ax, ay], i) => (
        <g key={i}>
          <circle cx={cx+ax} cy={cy+ay} r={Math.max(4, inputs.anchorDia*scale/2)} fill="rgba(154,103,0,0.15)" stroke="#D4A72C" strokeWidth="1"/>
          <circle cx={cx+ax} cy={cy+ay} r="2" fill="#9A6700"/>
          {i === 0 && (
            <text x={cx+ax+8} y={cy+ay+3} fill="#9A6700" fontSize="6">⌀{inputs.anchorDia}</text>
          )}
        </g>
      ))}

      {/* Center lines */}
      <line x1={cx-pN/2-8} y1={cy} x2={cx+pN/2+8} y2={cy} stroke="#CF222E" strokeWidth="0.5" strokeDasharray="6 3"/>
      <line x1={cx} y1={cy-pB/2-8} x2={cx} y2={cy+pB/2+8} stroke="#CF222E" strokeWidth="0.5" strokeDasharray="6 3"/>

      {/* Legend */}
      <rect x="6" y="250" width="268" height="22" fill="#F6F8FA" stroke="#D0D7DE" strokeWidth="0.5" rx="2"/>
      <circle cx="16" cy="261" r="4" fill="rgba(154,103,0,0.15)" stroke="#D4A72C" strokeWidth="0.75"/>
      <circle cx="16" cy="261" r="1.5" fill="#9A6700"/>
      <text x="24" y="264.5" fill="#656D76" fontSize="6.5">Anchor bolt ⌀{inputs.anchorDia}mm ({inputs.anchorCount} nos)</text>
      <rect x="130" y="257" width="8" height="5" fill="rgba(124,58,237,0.15)" stroke="#7C3AED" strokeWidth="0.5"/>
      <text x="142" y="264.5" fill="#656D76" fontSize="6.5">Column section</text>
      <rect x="196" y="257" width="8" height="5" fill="rgba(9,105,218,0.06)" stroke="#0969DA" strokeWidth="0.75"/>
      <text x="208" y="264.5" fill="#656D76" fontSize="6.5">Base plate</text>

      {/* Defs */}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0 0L6 3 0 6z" fill="#656D76"/>
        </marker>
      </defs>
    </svg>
  );
}

function ElevationView({ inputs }: { inputs: DesignInputs }) {
  const scale = 140 / Math.max(inputs.plate_N, inputs.col_d + 200, 200);
  const cx = 140;
  const colD = inputs.col_d * scale;
  const colBf = inputs.col_bf * scale;
  const colH = 100; // column height in svg units
  const plateH = Math.max(6, inputs.plate_tp * scale);
  const groutH = 4;
  const pedH = Math.max(40, inputs.ped_D * scale / 3);
  const baseY = 220;

  return (
    <svg viewBox="0 0 280 260" className="w-full h-full" fill="none">
      <text x="140" y="14" fill="#656D76" fontSize="9" textAnchor="middle" fontWeight="600">BASE PLATE — ELEVATION VIEW</text>

      {/* Pedestal */}
      <rect x={cx-70} y={baseY-pedH} width={140} height={pedH+20} fill="rgba(84,174,255,0.06)" stroke="#54AEFF" strokeWidth="1"/>
      <text x={cx} y={baseY+8} fill="#54AEFF" fontSize="7" textAnchor="middle">{inputs.supportType === 'PEDESTAL' ? `Concrete Pedestal — M${inputs.concreteGrade}` : `Slab on Grade — ${inputs.slab_ts}mm`}</text>

      {/* Grout */}
      <rect x={cx-colBf/2-15} y={baseY-pedH-groutH} width={colBf+30} height={groutH} fill="rgba(154,103,0,0.2)" stroke="#D4A72C" strokeWidth="0.75"/>
      <text x={cx+colBf/2+20} y={baseY-pedH-1} fill="#9A6700" fontSize="6">Grout 25mm</text>

      {/* Base plate */}
      <rect x={cx-colBf/2-15} y={baseY-pedH-groutH-plateH} width={colBf+30} height={plateH} fill="rgba(9,105,218,0.12)" stroke="#0969DA" strokeWidth="1.5"/>
      <text x={cx+colBf/2+20} y={baseY-pedH-groutH-plateH/2+3} fill="#0969DA" fontSize="6.5">tp={inputs.plate_tp}mm</text>

      {/* Column */}
      {/* Web */}
      <rect x={cx-inputs.col_tw*scale/2} y={baseY-pedH-groutH-plateH-colH} width={Math.max(3,inputs.col_tw*scale)} height={colH} fill="rgba(124,58,237,0.1)" stroke="#7C3AED" strokeWidth="1"/>
      {/* Flanges */}
      <rect x={cx-colBf/2} y={baseY-pedH-groutH-plateH-colH} width={colBf} height={Math.max(4,inputs.col_tf*scale)} fill="rgba(124,58,237,0.2)" stroke="#7C3AED" strokeWidth="1"/>
      <rect x={cx-colBf/2} y={baseY-pedH-groutH-plateH-4} width={colBf} height={Math.max(4,inputs.col_tf*scale)} fill="rgba(124,58,237,0.2)" stroke="#7C3AED" strokeWidth="1"/>
      <text x={cx} y={baseY-pedH-groutH-plateH-colH/2+3} fill="#7C3AED" fontSize="7" textAnchor="middle">{inputs.sectionName}</text>

      {/* Anchor bolts */}
      {[-1,1].map(side => {
        const ax = cx + side * (colBf/2 + 12);
        return (
          <g key={side}>
            <line x1={ax} y1={baseY-pedH-groutH} x2={ax} y2={baseY-20} stroke="#D4A72C" strokeWidth="1.5"/>
            <circle cx={ax} cy={baseY-pedH-groutH-3} r="3" fill="#9A6700"/>
            <circle cx={ax} cy={baseY-20} r="3" fill="#9A6700"/>
            <line x1={ax-6} y1={baseY-20} x2={ax+6} y2={baseY-20} stroke="#9A6700" strokeWidth="1.5"/>
          </g>
        );
      })}

      {/* Weld symbol */}
      <text x={cx-colBf/2-24} y={baseY-pedH-groutH-plateH/2+2} fill="#CF222E" fontSize="8" fontWeight="bold">Δ</text>
      <text x={cx-colBf/2-24} y={baseY-pedH-groutH-plateH/2+10} fill="#CF222E" fontSize="5.5">{inputs.weldSize}mm</text>

      {/* Dim line for hef */}
      <line x1={cx-70-14} y1={baseY-pedH-groutH} x2={cx-70-14} y2={baseY-20} stroke="#656D76" strokeWidth="0.75" strokeDasharray="2 2"/>
      <line x1={cx-70-18} y1={baseY-pedH-groutH} x2={cx-70-10} y2={baseY-pedH-groutH} stroke="#656D76" strokeWidth="0.75"/>
      <line x1={cx-70-18} y1={baseY-20} x2={cx-70-10} y2={baseY-20} stroke="#656D76" strokeWidth="0.75"/>
      <text x={cx-70-26} y={baseY-pedH/2} fill="#656D76" fontSize="6.5" textAnchor="middle" transform={`rotate(-90,${cx-70-26},${baseY-pedH/2})`}>hef={inputs.hef}mm</text>

      {/* Force arrows */}
      <line x1={cx} y1={baseY-pedH-groutH-plateH-colH-20} x2={cx} y2={baseY-pedH-groutH-plateH-colH-5} stroke="#CF222E" strokeWidth="2" markerEnd="url(#arrowE)"/>
      <text x={cx+5} y={baseY-pedH-groutH-plateH-colH-14} fill="#CF222E" fontSize="7" fontWeight="600">Pu={inputs.P}kN</text>
      <line x1={cx-colBf/2-30} y1={baseY-pedH-groutH-plateH-colH/2} x2={cx-colBf/2-5} y2={baseY-pedH-groutH-plateH-colH/2} stroke="#7C3AED" strokeWidth="2" markerEnd="url(#arrowE2)"/>
      <text x={cx-colBf/2-55} y={baseY-pedH-groutH-plateH-colH/2-4} fill="#7C3AED" fontSize="6.5">Vx={inputs.Vx}kN</text>

      <defs>
        <marker id="arrowE" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0 0L6 3 0 6z" fill="#CF222E"/>
        </marker>
        <marker id="arrowE2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0 0L6 3 0 6z" fill="#7C3AED"/>
        </marker>
      </defs>
    </svg>
  );
}

function SectionView({ inputs }: { inputs: DesignInputs }) {
  return (
    <svg viewBox="0 0 280 260" className="w-full h-full" fill="none">
      <text x="140" y="14" fill="#656D76" fontSize="9" textAnchor="middle" fontWeight="600">SECTION DETAIL — COLUMN BASE</text>
      {/* Section cut of column */}
      <g transform="translate(140,130)">
        <rect x={-inputs.col_bf/2*0.4} y={-inputs.col_d/2*0.4} width={inputs.col_bf*0.4} height={inputs.col_tf*0.8} fill="#7C3AED" fillOpacity="0.25" stroke="#7C3AED" strokeWidth="1.5"/>
        <rect x={-inputs.col_bf/2*0.4} y={inputs.col_d/2*0.4-inputs.col_tf*0.8} width={inputs.col_bf*0.4} height={inputs.col_tf*0.8} fill="#7C3AED" fillOpacity="0.25" stroke="#7C3AED" strokeWidth="1.5"/>
        <rect x={-inputs.col_tw/2*0.4} y={-inputs.col_d/2*0.4} width={inputs.col_tw*0.8} height={inputs.col_d*0.4} fill="#7C3AED" fillOpacity="0.15" stroke="#7C3AED" strokeWidth="1"/>
        <text x="0" y="60" fill="#656D76" fontSize="8" textAnchor="middle">Section A-A</text>
        <text x="0" y="70" fill="#8C959F" fontSize="6.5" textAnchor="middle">{inputs.sectionName}</text>
        <text x="0" y="80" fill="#8C959F" fontSize="6.5" textAnchor="middle">d={inputs.col_d} bf={inputs.col_bf} tf={inputs.col_tf} tw={inputs.col_tw} mm</text>
      </g>
      {/* Annotations */}
      <text x="20" y="60" fill="#0969DA" fontSize="7" fontWeight="600">PLATE</text>
      <text x="20" y="70" fill="#0969DA" fontSize="6.5">N×B×tp = {inputs.plate_N}×{inputs.plate_B}×{inputs.plate_tp}mm</text>
      <text x="20" y="90" fill="#9A6700" fontSize="7" fontWeight="600">ANCHORS</text>
      <text x="20" y="100" fill="#9A6700" fontSize="6.5">{inputs.anchorCount}×⌀{inputs.anchorDia}mm @ hef={inputs.hef}mm</text>
      <text x="20" y="110" fill="#9A6700" fontSize="6.5">Grade: {inputs.anchorGrade}</text>
      <text x="20" y="130" fill="#54AEFF" fontSize="7" fontWeight="600">CONCRETE</text>
      <text x="20" y="140" fill="#54AEFF" fontSize="6.5">{inputs.supportType}: {inputs.concreteGrade}</text>
      <text x="20" y="150" fill="#54AEFF" fontSize="6.5">fck = {inputs.fck} MPa</text>
      <text x="20" y="170" fill="#CF222E" fontSize="7" fontWeight="600">WELDS</text>
      <text x="20" y="180" fill="#CF222E" fontSize="6.5">{inputs.weldType} • s={inputs.weldSize}mm</text>
      <text x="20" y="190" fill="#CF222E" fontSize="6.5">{inputs.electrode}</text>
    </svg>
  );
}
