import type { Frame } from './catalog';
import { colorProfileFor } from './colorCurator';
import { roomAtmospheres } from './atmospheres';
import type { AtmosphereMode, RoomAtmosphere } from './atmospheres';

export function photoAtmosphere(photo:Frame,room:string):RoomAtmosphere {
  const palette=colorProfileFor(photo.id);
  const base=roomAtmospheres[room]||roomAtmospheres.archive;
  const green=palette.hue>=65&&palette.hue<175&&palette.saturation>.2;
  const cool=palette.hue>=175&&palette.hue<290&&palette.saturation>.12;
  let mode:AtmosphereMode=base.mode;
  if(photo.category==='Nature')mode='sakura';
  else if(photo.category==='Streets')mode=palette.lightness<32?'embers':cool?'silver':'dust';
  else if(photo.category==='People')mode=green?'petals':palette.lightness<28?'fireflies':'dust';
  else if(photo.category==='After dark')mode=cool?'stars':'fireflies';
  else if(photo.category==='Quiet')mode=cool?'silver':'dust';
  else if(photo.category==='Studio')mode='projector';
  const color=(mode==='sakura'?[205,128,151]:palette.rgb.map((value,i)=>Math.round(value*.48+[238,230,212][i]*.52))) as [number,number,number];
  return {...base,name:photo.title,mode,color,speed:mode==='sakura'?.17:mode==='embers'?.2:mode==='stars'?.035:mode==='leaves'?.12:.09,wash:mode==='sakura'?'#d89caf':palette.palette[0]};
}
