import type { Frame } from './catalog';
import { colorProfileFor } from './colorCurator';
import { roomAtmospheres } from './atmospheres';
import type { AtmosphereMode, RoomAtmosphere } from './atmospheres';

export function photoAtmosphere(photo:Frame,room:string):RoomAtmosphere {
  const palette=colorProfileFor(photo.id);
  const base=roomAtmospheres[room]||roomAtmospheres.archive;
  let mode:AtmosphereMode=base.mode;
  if(photo.category==='Nature')mode='sakura';
  else if(photo.category==='Streets')mode='rain';
  else if(photo.category==='People')mode='embers';
  else if(photo.category==='After dark')mode='lamps';
  else if(photo.category==='Quiet')mode='leaves';
  else if(photo.category==='Studio')mode='projector';
  const color=(mode==='sakura'?[205,128,151]:mode==='rain'?[163,177,183]:mode==='lamps'?[242,178,97]:mode==='leaves'?[137,165,117]:palette.rgb.map((value,i)=>Math.round(value*.48+[238,230,212][i]*.52))) as [number,number,number];
  return {...base,name:photo.title,mode,color,speed:mode==='sakura'?.17:mode==='rain'?.32:mode==='lamps'?.045:mode==='embers'?.13:mode==='leaves'?.12:.09,wash:mode==='sakura'?'#d89caf':mode==='rain'?'#8d9692':mode==='lamps'?'#ac7447':palette.palette[0]};
}
