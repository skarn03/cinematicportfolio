import type { Frame } from './catalog';

export type Composition='quartet'|'spotlight'|'triptych'|'offset-four'|'dialogue'|'panorama';
export type ExhibitSet={photos:Frame[];start:number;composition:Composition};
const rhythms:Record<string,{count:number;composition:Composition}[]>={
  Nature:[{count:4,composition:'quartet'},{count:1,composition:'spotlight'},{count:3,composition:'triptych'},{count:4,composition:'offset-four'},{count:2,composition:'dialogue'},{count:1,composition:'panorama'}],
  People:[{count:4,composition:'offset-four'},{count:1,composition:'spotlight'},{count:3,composition:'triptych'},{count:2,composition:'dialogue'},{count:4,composition:'quartet'}],
  Streets:[{count:4,composition:'quartet'},{count:1,composition:'panorama'},{count:3,composition:'triptych'},{count:4,composition:'offset-four'},{count:2,composition:'dialogue'},{count:1,composition:'spotlight'}],
  Quiet:[{count:3,composition:'triptych'},{count:1,composition:'spotlight'},{count:4,composition:'offset-four'},{count:2,composition:'dialogue'}],
  'After dark':[{count:3,composition:'triptych'},{count:1,composition:'spotlight'},{count:3,composition:'offset-four'},{count:2,composition:'dialogue'}],
};
export function makeExhibitSequence(photos:Frame[],room:string):ExhibitSet[]{
  const rhythm=rhythms[room]||rhythms.Streets;
  const groups:ExhibitSet[]=[];
  let start=0,step=0;
  while(start<photos.length){const beat=rhythm[step%rhythm.length];const pieces=photos.slice(start,start+beat.count);groups.push({photos:pieces,start,composition:pieces.length===1&&beat.count!==1?'spotlight':beat.composition});start+=pieces.length;step++;}
  return groups;
}
