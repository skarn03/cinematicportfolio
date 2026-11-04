import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { Frame } from './catalog';
import { imagePoetry } from './imagePoetry';
import { colorProfileFor } from './colorCurator';
import { makeExhibitSequence } from './exhibitSequence';

type Props={id:string;title:string;subtitle:string;number:string;photos:Frame[];onOpen:(id:string)=>void;onActivePhoto?:(room:string,photo:string)=>void};
const modes:Record<string,string>={People:'portrait-pairs',Nature:'landscape-journal',Streets:'street-editorial',Quiet:'scattered-prints','After dark':'night-cinema',Studio:'studio-studies'};

function Exhibit({photo,index,spotlight,room,onOpen,onActivePhoto}:{photo:Frame;index:number;spotlight:boolean;room:string;onOpen:Props['onOpen'];onActivePhoto:Props['onActivePhoto']}) {
  const element=useRef<HTMLElement>(null);
  const near=useInView(element,{margin:'250px 0px',once:true});
  const focused=useInView(element,{margin:'-25% 0px -30% 0px',amount:.18});
  const reduced=useReducedMotion();
  const [loaded,setLoaded]=useState(false);
  const solo=spotlight;
  const shape=solo?'full':index%4===0?'arch':index%4===1?'soft-cut':index%4===2?'oval':'slanted';
  const entrance=index%4===0?{opacity:0,y:55,scale:.98}:index%4===1?{opacity:0,x:40,rotate:2}:index%4===2?{opacity:0,scale:.92,y:20}:{opacity:0,x:-35,y:20};
  useEffect(()=>{if(focused)onActivePhoto?.(room,photo.id);},[focused,photo.id,room,onActivePhoto]);
  return <motion.figure ref={element} className={`sequence-print editorial-print ${solo?'solo-exhibit':''} exhibit-${index%6}`} data-image-id={photo.id} data-source={photo.source} style={{'--image-ratio':photo.aspect,'--print-color':colorProfileFor(photo.id).palette[0]} as CSSProperties} initial={reduced?false:entrance} whileInView={{opacity:1,x:0,y:0,scale:1,rotate:0}} viewport={{once:true,amount:.12}} transition={{duration:1.1,delay:reduced?0:(index%2)*.12,ease:[.16,1,.3,1]}}>
    <div className={`exhibit-artwork shape-${shape}`}><button className="sequence-image editorial-image" data-view="true" onClick={()=>onOpen(photo.id)} aria-label={`View ${photo.title}, ${photo.sourceName}`}><img className="print-preview" src={photo.thumbnail} alt={photo.description} loading="lazy" decoding="async" draggable={false}/>{near&&<img className={loaded?'print-original is-loaded':'print-original'} src={photo.src} srcSet={photo.srcSet} sizes={solo?'90vw':'(max-width: 650px) 45vw, 28vw'} alt="" aria-hidden="true" onLoad={()=>setLoaded(true)} decoding="async"/>}</button>{solo&&<div className="solo-image-caption"><span>{photo.category.toUpperCase()} / {String(index+1).padStart(2,'0')}</span><blockquote>{imagePoetry[photo.id]||photo.title}</blockquote><small>SAHIL KARN</small></div>}</div>
    {!solo&&imagePoetry[photo.id]&&<blockquote className="image-whisper">{imagePoetry[photo.id]}</blockquote>}<figcaption><span>{String(index+1).padStart(2,'0')}</span><span>{photo.title}</span><span>{photo.source}</span></figcaption>
  </motion.figure>;
}

export default function EditorialRoom({id,title,subtitle,number,photos,onOpen,onActivePhoto}:Props) {
  const layout=modes[title]||'portrait-pairs';
  const sequence=useMemo(()=>makeExhibitSequence(photos,title),[photos,title]);
  const [visible,setVisible]=useState(1);
  const sentinel=useRef<HTMLDivElement>(null);
  const reduced=useReducedMotion();
  const more=visible<sequence.length;
  const groups=sequence.slice(0,visible);
  const revealed=groups.reduce((count,group)=>count+group.photos.length,0);
  useEffect(()=>{
    const target=sentinel.current;if(!target||!more)return;
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))setVisible(current=>Math.min(sequence.length,current+1));},{rootMargin:'120px 0px',threshold:.1});
    observer.observe(target);return()=>observer.disconnect();
  },[visible,more,sequence.length]);
  return <section id={id} className={`gallery-room editorial-room layout-${layout}`} data-gallery-room={title} data-layout={layout} aria-labelledby={`${id}-title`}>
    <motion.div className="room-heading editorial-heading" initial={reduced?false:{opacity:0,y:25}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:1}}><span>{number} / A PHOTOGRAPHIC STUDY</span><h2 id={`${id}-title`}>{title}</h2><p>{subtitle}</p><i aria-hidden="true">✧</i></motion.div>
    <div className="editorial-wall">{groups.map((group,groupIndex)=>{const spotlight=group.photos.length===1;const featured=group.photos.some(photo=>photo.id==='bloom-pond-figure');return <motion.div className={`exhibit-group exhibit-group-${groupIndex%2} composition-${group.composition} ${featured?'blossom-highlight':''}`} data-exhibit-group data-composition={group.composition} key={group.photos[0].id} initial={reduced?false:group.composition==='spotlight'?{opacity:0,scale:.94}:group.composition==='triptych'?{opacity:0,x:-35}:group.composition==='offset-four'?{opacity:0,y:45}:{opacity:0,y:20}} whileInView={{opacity:1,scale:1,x:0,y:0}} viewport={{once:true,amount:.08}} transition={{duration:1.2,ease:[.16,1,.3,1]}}>{spotlight&&<div className="spotlight-room-title"><span>{featured?'THE BLOSSOM STUDY':`STUDY ${String(groupIndex+1).padStart(2,'0')}`}</span><h3>{featured?'There is no hurry.':title}</h3></div>}{group.photos.map((photo,index)=><Exhibit key={photo.id} photo={photo} index={group.start+index} spotlight={spotlight} room={id} onOpen={onOpen} onActivePhoto={onActivePhoto}/>)}{title==='Nature'&&groupIndex===0&&<p className="nature-wall-note"><span>IN THE QUIET OF SPRING</span>Let the season<br/>stay a little longer.</p>}</motion.div>;})}</div>
    <div ref={sentinel} className="exhibit-unlock" data-exhibit-unlock aria-live="polite"><span>{String(revealed).padStart(2,'0')} / {photos.length} IMAGES REVEALED</span>{more?<><p>Keep wandering. There is more ahead.</p><button onClick={()=>setVisible(current=>Math.min(sequence.length,current+1))}>Reveal the next exhibit ↓</button></>:<p>The end of this study. Scroll into the next.</p>}</div>
  </section>;
}
