import profiles from '../data/colorProfiles.json';

export type ColorProfile={lab:number[];rgb:number[];palette:string[];hue:number;saturation:number;lightness:number};
const paletteMap:Record<string,ColorProfile>=profiles;
export function colorProfileFor(id:string):ColorProfile {
  return paletteMap[id]||{lab:[45,0,0],rgb:[130,138,124],palette:['#828a7c'],hue:95,saturation:.1,lightness:45};
}
export function colorDistance(a:string,b:string):number {
  const first=colorProfileFor(a),second=colorProfileFor(b);
  return Math.hypot((first.lab[0]-second.lab[0])*.75,first.lab[1]-second.lab[1],first.lab[2]-second.lab[2])+
    Math.hypot(...first.rgb.map((value,i)=>(value-second.rgb[i])*.035));
}
export function sequenceCost(photos:{id:string}[]):number {
  return photos.slice(1).reduce((sum,photo,index)=>sum+colorDistance(photos[index].id,photo.id),0);
}
export function sequenceByColor<T extends {id:string}>(photos:T[]):T[] {
  if(photos.length<3)return [...photos];
  const n=photos.length;
  const distances=photos.map(a=>photos.map(b=>colorDistance(a.id,b.id)));
  const brightness=photos.map((photo,index)=>({index,l:colorProfileFor(photo.id).lightness})).sort((a,b)=>a.l-b.l);
  const starts=[0,brightness[0].index,brightness[n-1].index,brightness[Math.floor(n/2)].index];
  const cost=(indices:number[])=>indices.slice(1).reduce((sum,next,i)=>sum+distances[indices[i]][next],0);
  let best=photos.map((_,index)=>index),bestCost=cost(best);
  for(const start of new Set(starts)){
    const remaining=new Set(photos.map((_,index)=>index));remaining.delete(start);
    const path=[start];
    while(remaining.size){const last=path[path.length-1];let next=-1,nearest=Infinity;for(const candidate of remaining){if(distances[last][candidate]<nearest){nearest=distances[last][candidate];next=candidate;}}path.push(next);remaining.delete(next);}
    for(let pass=0;pass<4;pass++){
      let changed=false;
      for(let i=0;i<n-3;i++)for(let k=i+2;k<n-1;k++){
        const a=path[i],b=path[i+1],c=path[k],d=path[k+1];
        if(distances[a][c]+distances[b][d]+.001<distances[a][b]+distances[c][d]){path.splice(i+1,k-i,...path.slice(i+1,k+1).reverse());changed=true;}
      }
      if(!changed)break;
    }
    const total=cost(path);if(total<bestCost){best=path;bestCost=total;}
  }
  return best.map(index=>photos[index]);
}
