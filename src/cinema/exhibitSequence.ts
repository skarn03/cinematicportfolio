import type { Frame } from './catalog';

export type Composition='quartet'|'spotlight'|'triptych'|'offset-four'|'dialogue'|'panorama'|'mosaic'|'filmstrip'|'staggered';
export type ExhibitSet={photos:Frame[];start:number;composition:Composition};
const rhythms:Record<string,{count:number;composition:Composition}[]>={
  Nature:[{count:4,composition:'quartet'},{count:1,composition:'spotlight'},{count:6,composition:'mosaic'},{count:8,composition:'filmstrip'},{count:6,composition:'staggered'}],
  People:[{count:6,composition:'staggered'},{count:8,composition:'filmstrip'},{count:6,composition:'mosaic'}],
  Streets:[{count:6,composition:'mosaic'},{count:8,composition:'filmstrip'},{count:6,composition:'staggered'}],
  Quiet:[{count:6,composition:'filmstrip'},{count:6,composition:'staggered'},{count:8,composition:'mosaic'}],
  'After dark':[{count:6,composition:'staggered'},{count:8,composition:'filmstrip'},{count:6,composition:'mosaic'}],
};
export function makeExhibitSequence(photos:Frame[],room:string):ExhibitSet[]{
  const rhythm=rhythms[room]||rhythms.Streets;
  const groups:ExhibitSet[]=[];
  let start=0,step=0;
  while(start<photos.length){const beat=rhythm[step%rhythm.length];const pieces=photos.slice(start,start+beat.count);groups.push({photos:pieces,start,composition:pieces.length===1&&beat.count!==1?'spotlight':beat.composition});start+=pieces.length;step++;}
  return groups;
}
