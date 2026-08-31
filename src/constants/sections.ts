import type { SectionProps } from '../types';

export const IS_SECTIONS: Record<string, SectionProps> = {
  'ISMB 100':  { name: 'ISMB 100',  d: 100, bf: 75,  tf: 7.5,  tw: 4.0,  Ix: 257.5,   Sx: 51.5,  weight: 8.9,  source: 'IS 808:1989' },
  'ISMB 150':  { name: 'ISMB 150',  d: 150, bf: 80,  tf: 7.6,  tw: 4.8,  Ix: 726.4,   Sx: 96.9,  weight: 14.9, source: 'IS 808:1989' },
  'ISMB 200':  { name: 'ISMB 200',  d: 200, bf: 100, tf: 10.8, tw: 5.7,  Ix: 2235.4,  Sx: 223.5, weight: 25.4, source: 'IS 808:1989' },
  'ISMB 250':  { name: 'ISMB 250',  d: 250, bf: 125, tf: 12.5, tw: 6.9,  Ix: 5131.6,  Sx: 410.5, weight: 37.3, source: 'IS 808:1989' },
  'ISMB 300':  { name: 'ISMB 300',  d: 300, bf: 140, tf: 13.1, tw: 7.5,  Ix: 8603.6,  Sx: 573.6, weight: 46.1, source: 'IS 808:1989' },
  'ISMB 350':  { name: 'ISMB 350',  d: 350, bf: 140, tf: 14.2, tw: 8.1,  Ix: 13630.3, Sx: 778.9, weight: 52.4, source: 'IS 808:1989' },
  'ISMB 400':  { name: 'ISMB 400',  d: 400, bf: 140, tf: 16.0, tw: 8.9,  Ix: 20458.4, Sx: 1022.9,weight: 61.5, source: 'IS 808:1989' },
  'ISMB 450':  { name: 'ISMB 450',  d: 450, bf: 150, tf: 17.4, tw: 9.4,  Ix: 30390.6, Sx: 1350.7,weight: 72.4, source: 'IS 808:1989' },
  'ISMB 500':  { name: 'ISMB 500',  d: 500, bf: 180, tf: 17.2, tw: 10.2, Ix: 45218.3, Sx: 1808.7,weight: 86.9, source: 'IS 808:1989' },
  'ISMB 550':  { name: 'ISMB 550',  d: 550, bf: 190, tf: 19.3, tw: 11.2, Ix: 64893.6, Sx: 2359.8,weight: 103.7,source: 'IS 808:1989' },
  'ISMB 600':  { name: 'ISMB 600',  d: 600, bf: 210, tf: 20.8, tw: 12.0, Ix: 91813.0, Sx: 3060.4,weight: 122.6,source: 'IS 808:1989' },
  'ISHB 150':  { name: 'ISHB 150',  d: 150, bf: 150, tf: 9.0,  tw: 5.4,  Ix: 1052.8,  Sx: 140.4, weight: 27.1, source: 'IS 808:1989' },
  'ISHB 200':  { name: 'ISHB 200',  d: 200, bf: 200, tf: 9.0,  tw: 6.1,  Ix: 3607.8,  Sx: 360.8, weight: 36.7, source: 'IS 808:1989' },
  'ISHB 250':  { name: 'ISHB 250',  d: 250, bf: 250, tf: 9.7,  tw: 6.9,  Ix: 7983.9,  Sx: 638.7, weight: 51.0, source: 'IS 808:1989' },
  'ISHB 300':  { name: 'ISHB 300',  d: 300, bf: 250, tf: 10.6, tw: 7.6,  Ix: 12545.2, Sx: 836.3, weight: 58.8, source: 'IS 808:1989' },
  'ISHB 350':  { name: 'ISHB 350',  d: 350, bf: 250, tf: 11.6, tw: 8.3,  Ix: 19399.0, Sx: 1108.5,weight: 67.4, source: 'IS 808:1989' },
  'ISHB 400':  { name: 'ISHB 400',  d: 400, bf: 250, tf: 12.7, tw: 8.8,  Ix: 28870.3, Sx: 1443.5,weight: 77.4, source: 'IS 808:1989' },
};

export const AISC_SECTIONS: Record<string, SectionProps> = {
  'W8x31':   { name: 'W8x31',   d: 203, bf: 203, tf: 11.0, tw: 7.2,  Ix: 4742,   Sx: 466,  weight: 46.2,  source: 'AISC 16th Ed' },
  'W8x40':   { name: 'W8x40',   d: 210, bf: 205, tf: 14.2, tw: 8.1,  Ix: 6156,   Sx: 587,  weight: 59.5,  source: 'AISC 16th Ed' },
  'W8x48':   { name: 'W8x48',   d: 216, bf: 206, tf: 17.4, tw: 9.1,  Ix: 7492,   Sx: 693,  weight: 71.4,  source: 'AISC 16th Ed' },
  'W10x49':  { name: 'W10x49',  d: 253, bf: 254, tf: 14.2, tw: 8.6,  Ix: 12049,  Sx: 953,  weight: 72.9,  source: 'AISC 16th Ed' },
  'W10x68':  { name: 'W10x68',  d: 260, bf: 256, tf: 19.6, tw: 10.0, Ix: 16615,  Sx: 1278, weight: 101.2, source: 'AISC 16th Ed' },
  'W12x53':  { name: 'W12x53',  d: 307, bf: 254, tf: 15.7, tw: 9.4,  Ix: 19543,  Sx: 1274, weight: 78.9,  source: 'AISC 16th Ed' },
  'W12x72':  { name: 'W12x72',  d: 315, bf: 255, tf: 21.1, tw: 10.9, Ix: 26694,  Sx: 1695, weight: 107.1, source: 'AISC 16th Ed' },
  'W14x68':  { name: 'W14x68',  d: 358, bf: 254, tf: 18.0, tw: 10.5, Ix: 37156,  Sx: 2076, weight: 101.2, source: 'AISC 16th Ed' },
  'W14x90':  { name: 'W14x90',  d: 362, bf: 257, tf: 23.6, tw: 11.2, Ix: 49118,  Sx: 2714, weight: 133.9, source: 'AISC 16th Ed' },
  'W14x120': { name: 'W14x120', d: 373, bf: 264, tf: 30.2, tw: 13.1, Ix: 67088,  Sx: 3596, weight: 178.6, source: 'AISC 16th Ed' },
  'W16x77':  { name: 'W16x77',  d: 410, bf: 260, tf: 18.9, tw: 11.9, Ix: 54779,  Sx: 2671, weight: 114.6, source: 'AISC 16th Ed' },
  'W18x97':  { name: 'W18x97',  d: 463, bf: 283, tf: 21.3, tw: 11.9, Ix: 94068,  Sx: 4064, weight: 144.3, source: 'AISC 16th Ed' },
  'W24x76':  { name: 'W24x76',  d: 599, bf: 222, tf: 14.4, tw: 8.9,  Ix: 141982, Sx: 4741, weight: 113.1, source: 'AISC 16th Ed' },
};

export function getSectionsByCode(code: string, columnType: string): Record<string, SectionProps> {
  if (code === 'IS800') {
    if (columnType.startsWith('ISMB')) return Object.fromEntries(
      Object.entries(IS_SECTIONS).filter(([k]) => k.startsWith('ISMB'))
    );
    if (columnType.startsWith('ISHB')) return Object.fromEntries(
      Object.entries(IS_SECTIONS).filter(([k]) => k.startsWith('ISHB'))
    );
    return IS_SECTIONS;
  }
  return AISC_SECTIONS;
}
