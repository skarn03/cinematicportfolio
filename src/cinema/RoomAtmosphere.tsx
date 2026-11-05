import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { roomAtmospheres } from './atmospheres';
import type { RoomAtmosphere as Atmosphere } from './atmospheres';
import type { AtmosphereMode } from './atmospheres';
import type { Frame } from './catalog';
import { photoAtmosphere } from './photoAtmosphere';

type Particle = {x:number;y:number;size:number;phase:number;drift:number};

const modes:AtmosphereMode[]=['fireflies','dust','petals','silver','projector','leaves','embers','stars','sakura','rain','lamps'];
export default function RoomAtmosphere({room,photo,paused,onToggle,controls=true}:{room:string;photo?:Frame|null;paused:boolean;onToggle:()=>void;controls?:boolean}) {
  const reduced=useReducedMotion();
  const canvas=useRef<HTMLCanvasElement>(null);
  const profile=useMemo(()=>photo?photoAtmosphere(photo,room):roomAtmospheres[room]||roomAtmospheres.home,[photo,room]);
  const target=useRef(profile);
  const displayed=useRef({color:[...profile.color],speed:profile.speed,weights:Object.fromEntries(modes.map(mode=>[mode,mode===profile.mode?1:0])) as Record<AtmosphereMode,number>});
  useEffect(() => {target.current=profile;},[profile]);
  useEffect(() => {
    const surface=canvas.current;
    if(!surface || reduced || paused) return;
    const ctx=surface.getContext('2d');
    if(!ctx) return;
    let width=0,height=0,raf=0,last=0,elapsed=0;
    const particles:Particle[]=Array.from({length:window.innerWidth<650?42:92},(_,i)=>({x:((i*137.508)%100)/100,y:((i*71.73)%100)/100,size:1.1+(i%7)*.42,phase:i*2.39,drift:.4+(i%5)*.18}));
    const resize=()=>{width=window.innerWidth;height=window.innerHeight;const ratio=Math.min(window.devicePixelRatio||1,1.5);surface.width=Math.round(width*ratio);surface.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);};
    resize();
    function paint(particle:Particle,atmosphere:Atmosphere,opacity:number,time:number) {
      if(!ctx||opacity<.01) return;
      const {mode,color}=atmosphere;
      const phase=particle.phase;
      const x=particle.x*width;
      const y=particle.y*height;
      const centralFade=x>width*.18 && x<width*.78?.82:1;
      const alpha=(.42+Math.sin(time*.7+phase)*.12)*opacity*centralFade;
      ctx.save();ctx.translate(x,y);ctx.rotate(time*.1+phase);
      ctx.fillStyle=`rgba(${color.join(',')},${alpha})`;
      if(mode==='sakura') {
        const size=particle.size*3.8;ctx.scale(1,.62+Math.sin(time*.8+phase)*.3);
        ctx.fillStyle=`rgba(${color.join(',')},${Math.min(.62,alpha*1.5)})`;
        ctx.beginPath();ctx.moveTo(0,-size);ctx.bezierCurveTo(-size*1.25,-size*.6,-size*.85,size*.6,0,size);ctx.bezierCurveTo(size*.95,size*.2,size*1.1,-size*.65,size*.3,-size*.85);ctx.lineTo(size*.05,-size*.55);ctx.closePath();ctx.fill();
        ctx.strokeStyle=`rgba(163,88,117,${alpha*.45})`;ctx.lineWidth=.45;ctx.stroke();
      } else if(mode==='petals'||mode==='leaves') {
        ctx.beginPath();ctx.ellipse(0,0,particle.size*3,particle.size*.9,Math.sin(time*.2+phase),0,Math.PI*2);ctx.fill();
      } else if(mode==='rain') {
        ctx.rotate(-time*.1-phase);ctx.strokeStyle=`rgba(${color.join(',')},${Math.min(.64,alpha*1.5)})`;ctx.lineWidth=Math.max(.6,particle.size*.6);ctx.beginPath();ctx.moveTo(0,-particle.size*7);ctx.lineTo(-particle.size*2,particle.size*9);ctx.stroke();
      } else if(mode==='lamps') {
        const glow=.5+.5*Math.sin(time*.7+phase);ctx.shadowColor=`rgba(${color.join(',')},${.5*glow})`;ctx.shadowBlur=24+particle.size*9;ctx.beginPath();ctx.arc(0,0,particle.size*(1+glow),0,Math.PI*2);ctx.fill();
      } else if(mode==='stars') {
        ctx.fillRect(-particle.size*2.2,-.4,particle.size*4.4,.8);ctx.fillRect(-.4,-particle.size*2.2,.8,particle.size*4.4);
      } else {
        if(mode==='fireflies'||mode==='embers') {ctx.shadowColor=`rgba(${color.join(',')},.65)`;ctx.shadowBlur=mode==='fireflies'?17:8;}
        ctx.beginPath();ctx.arc(0,0,particle.size*(mode==='silver'?.7:1),0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }
    function draw(now:number) {
      if(!ctx) return;
      const delta=last?Math.min((now-last)/1000,.05):0;last=now;elapsed+=delta;
      ctx.clearRect(0,0,width,height);
      const current=displayed.current;
      const desired=target.current;
      const ease=1-Math.exp(-delta/2.4);
      current.color=current.color.map((value,i)=>value+(desired.color[i]-value)*ease);
      current.speed+=(desired.speed-current.speed)*ease;
      for(const mode of modes)current.weights[mode]+=((mode===desired.mode?1:0)-current.weights[mode])*ease;
      const projector=current.weights.projector;
      const lamps=current.weights.lamps;
      if(lamps>.01){for(let i=0;i<3;i++){const x=width*(.17+i*.32);const y=height*(.2+(i%2)*.14);const pulse=.55+.2*Math.sin(elapsed*.6+i);const halo=ctx.createRadialGradient(x,y,2,x,y,width*.2);halo.addColorStop(0,`rgba(245,169,82,${.09*lamps*pulse})`);halo.addColorStop(1,'rgba(245,169,82,0)');ctx.fillStyle=halo;ctx.fillRect(x-width*.2,y-width*.2,width*.4,width*.4);}}
      if(projector>.01) {const beam=ctx.createLinearGradient(width*.1,0,width*.8,height);beam.addColorStop(0,`rgba(230,216,172,${.028*projector})`);beam.addColorStop(1,'rgba(230,216,172,0)');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(width*.74,0);ctx.lineTo(width*.12,height);ctx.lineTo(width*.95,height);ctx.closePath();ctx.fill();}
      const direction=1-2*(current.weights.embers+current.weights.fireflies);
      const color=current.color.map(Math.round) as [number,number,number];
      for(const particle of particles) {
        particle.x=((particle.x+Math.sin(elapsed*.3+particle.phase)*delta*(.002+current.weights.sakura*.007)+delta*current.speed*.006*particle.drift)%1+1)%1;
        particle.y=((particle.y+direction*delta*(current.speed*.025+current.weights.sakura*.024)*particle.drift)%1+1)%1;
        for(const mode of modes)if(current.weights[mode]>.008)paint(particle,{...desired,mode,color},current.weights[mode],elapsed);
      }
      raf=requestAnimationFrame(draw);
    }
    const visibility=()=>{cancelAnimationFrame(raf);last=0;if(!document.hidden)raf=requestAnimationFrame(draw);};
    if(!document.hidden)raf=requestAnimationFrame(draw);
    window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);ctx.clearRect(0,0,width,height);};
  },[paused,reduced]);
  return <><div className="room-atmosphere" data-room={room} data-image={photo?.id} data-mode={profile.mode} data-paused={paused||!!reduced} style={{'--room-wash':profile.wash} as CSSProperties} aria-hidden="true"><div className="room-light-wash" style={{backgroundColor:profile.wash}}/>{!reduced&&<canvas ref={canvas}/>}</div>{controls&&<div className="atmosphere-controls"><span>{profile.name}</span><button onClick={onToggle} disabled={!!reduced} aria-pressed={paused} aria-label={paused?'Resume gallery atmosphere':'Pause gallery atmosphere'}>{reduced?'Reduced motion':paused?'Atmosphere paused':'Pause atmosphere'}<span aria-hidden="true">{paused?'▷':'Ⅱ'}</span></button></div>}</>;
}
