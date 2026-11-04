import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function GalleryCursor() {
  const element=useRef<HTMLDivElement>(null);
  const reduced=useReducedMotion();
  useEffect(()=>{
    if(reduced||!window.matchMedia('(pointer:fine) and (hover:hover)').matches)return;
    const cursor=element.current;if(!cursor)return;
    function move(event:globalThis.PointerEvent){if(!cursor)return;cursor.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;const over=!!(event.target as HTMLElement)?.closest('[data-view]');cursor.dataset.visible=String(over);}
    const leave=()=>{cursor.dataset.visible='false';};
    window.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',leave);
    return()=>{window.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);};
  },[reduced]);
  return reduced?null:<div ref={element} className="gallery-cursor" aria-hidden="true" data-visible="false"><span>VIEW</span></div>;
}
