import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { frames } from './catalog';
import type { Category } from './catalog';
import { imagePoetry } from './imagePoetry';
import RoomAtmosphere from './RoomAtmosphere';

export default function FullscreenViewer({id,category='All',onClose,paused=false,onToggle}:{id:string;category?:Category;onClose:()=>void;paused?:boolean;onToggle?:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const reduced=useReducedMotion();
  const photos=useMemo(()=>category==='All'?frames:frames.filter(photo=>photo.category===category),[category]);
  const [index,setIndex]=useState(()=>Math.max(0,photos.findIndex(photo=>photo.id===id)));
  const [info,setInfo]=useState(false);
  const [showStrip,setShowStrip]=useState(false);
  const [zoom,setZoom]=useState(1);
  const draggedUntil=useRef(0);
  const panX=useMotionValue(0),panY=useMotionValue(0);
  const touch=useRef<{x:number;y:number}|null>(null);
  const photo=photos[index];
  const strip=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=dialog.current;el?.showModal();
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    return()=>{el?.close();document.body.style.overflow=previous;};
  },[]);
  useEffect(()=>{
    const preload=photos[(index+1)%photos.length];const image=new Image();image.decoding='async';image.src=preload.fullSrc||preload.src;
    if(showStrip)strip.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({block:'nearest',inline:'center',behavior:reduced?'instant':'smooth'});
  },[index,photos,showStrip,reduced]);
  function step(direction:number){setZoom(1);setIndex(current=>(current+direction+photos.length)%photos.length);}
  useEffect(()=>{setZoom(1);},[photo.id]);
  return <dialog ref={dialog} className={`immersive-viewer ${showStrip?'with-strip':''}`} aria-label="Full-screen photography viewer" onClose={onClose} data-lenis-prevent onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();step(1);}if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}if(event.key==='Home'){event.preventDefault();setIndex(0);}if(event.key==='End'){event.preventDefault();setIndex(photos.length-1);}}}>
    <RoomAtmosphere room="archive" photo={photo} paused={paused} onToggle={onToggle||(()=>{})} controls={false}/>
    <div className="viewer-top"><span>{category==='All'?'THE COMPLETE COLLECTION':category.toUpperCase()}</span><button onClick={onClose} autoFocus aria-label="Close full-screen viewer">Close <span>×</span></button></div>
    <div className="viewer-stage" data-zoomed={zoom>1} onPointerDown={event=>{if(zoom===1&&event.pointerType==='touch'&&event.isPrimary)touch.current={x:event.clientX,y:event.clientY};}} onPointerUp={event=>{if(!touch.current||zoom>1)return;const dx=event.clientX-touch.current.x;const dy=event.clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>65&&Math.abs(dy)<90)step(dx<0?1:-1);}}>
      <AnimatePresence initial={false}><motion.img key={photo.id} src={photo.fullSrc||photo.src} alt={photo.description} initial={{opacity:0,scale:reduced?1:1.015}} style={{x:panX,y:panY}} animate={{opacity:1,scale:zoom,x:zoom===1?0:panX.get(),y:zoom===1?0:panY.get()}} exit={{opacity:0}} transition={{duration:reduced?0:.45,ease:[.22,1,.36,1]}} draggable={false} drag={zoom>1} dragConstraints={{left:-window.innerWidth*.4,right:window.innerWidth*.4,top:-window.innerHeight*.4,bottom:window.innerHeight*.4}} dragMomentum={false} onDragStart={()=>{draggedUntil.current=Infinity;}} onDragEnd={()=>{draggedUntil.current=performance.now()+200;}} onClick={()=>{if(performance.now()>draggedUntil.current)setZoom(zoom===1?2:1);}}/></AnimatePresence>
      <button className="viewer-previous" onClick={()=>step(-1)} aria-label="Previous photograph">←</button><button className="viewer-next" onClick={()=>step(1)} aria-label="Next photograph">→</button>
    </div>
    {imagePoetry[photo.id]&&<blockquote className="viewer-whisper">{imagePoetry[photo.id]}</blockquote>}
    <div className="viewer-bottom"><div aria-live="polite"><span>{String(index+1).padStart(3,'0')} / {photos.length}</span><h2>{photo.title}</h2></div><div><button aria-label={zoom===1?'Zoom photograph':'Fit photograph'} aria-pressed={zoom>1} onClick={()=>setZoom(zoom===1?2:1)}>{zoom===1?'Zoom +':'Fit −'}</button><button aria-pressed={info} onClick={()=>setInfo(!info)}>Details</button><button aria-pressed={showStrip} onClick={()=>setShowStrip(!showStrip)}>Contact sheet</button></div></div>
    {info&&<div className="viewer-info"><p>{photo.description}</p><span>{photo.source} · {photo.category}</span><a href={photo.fullSrc||photo.src} target="_blank" rel="noopener">Open image ↗</a></div>}
    {showStrip&&<div className="viewer-strip" ref={strip} aria-label="Choose a photograph">{photos.map((item,i)=><button key={item.id} aria-label={`View ${item.title}, ${item.sourceName}`} aria-pressed={i===index} onClick={()=>setIndex(i)}><img src={item.thumbnail} alt="" loading="lazy"/></button>)}</div>}
  </dialog>;
}
