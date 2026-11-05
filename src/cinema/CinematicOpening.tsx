import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import type { GalleryTheme } from './ThemeToggle';
import { frame } from './catalog';
import { contactLinks, mailtoHref } from '../data/contact';

export function PortfolioHeader({theme='light',onThemeToggle=()=>{},fullscreen=false,onToggleFullscreen=()=>{}}:{active:string;theme?:GalleryTheme;onThemeToggle?:()=>void;onNavigate?:(id:string)=>void;fullscreen?:boolean;onToggleFullscreen?:()=>void}) {
  const [contactOpen,setContactOpen]=useState(false);
  const instagram=contactLinks.socials.find(s=>s.icon==='instagram'&&s.url);
  return <><header className="portfolio-header"><a className="portfolio-wordmark" href="#home" aria-label="Sahil Karn, home"><span className="portfolio-monogram">sk.</span><span>SAHIL KARN<small>PHOTOGRAPHER & FILMMAKER</small></span></a><div className="portfolio-navigation"><button className="portfolio-fullscreen-toggle" onClick={onToggleFullscreen} aria-pressed={fullscreen}>{fullscreen?"Exit full screen":"View full screen"}</button><button className="portfolio-work-link" onClick={()=>setContactOpen(true)}>Contact <span>?</span></button><ThemeToggle theme={theme} onToggle={onThemeToggle}/></div></header>{contactOpen&&<dialog className="contact-overlay" open aria-labelledby="contact-overlay-title" onClick={event=>{if(event.target===event.currentTarget)setContactOpen(false);}} onKeyDown={event=>{if(event.key==='Escape')setContactOpen(false);}}><div className="contact-overlay-panel"><button className="contact-overlay-close" onClick={()=>setContactOpen(false)} aria-label="Close contact overlay">Close ?</button><span>SAHIL KARN / AVAILABLE FOR SELECT PROJECTS</span><h2 id="contact-overlay-title">Let?s make<br/><em>something felt.</em></h2><p>Photography, cinematography, and creative collaborations.</p><a className="contact-overlay-email" href={mailtoHref()}>{contactLinks.email} ?</a>{instagram&&<a className="contact-overlay-social" href={instagram.url} target="_blank" rel="noopener">Instagram / {instagram.handle} ?</a>}</div></dialog>}</>;
}
export function CinematicOpening({onFilm,onFrameChange}:{onFilm:()=>void;onFrameChange?:(id:string)=>void}) {
  const reduced=useReducedMotion();
  const photo=frame('bloom-pond-figure');
  useEffect(()=>{onFrameChange?.(photo.id);},[photo.id,onFrameChange]);
  return <section id="home" className="restored-hero spring-opening" data-exhibition-room aria-labelledby="restored-hero-title">
    <motion.img className="restored-hero-image" src={photo.fullSrc||photo.src} alt={photo.description} initial={reduced?false:{opacity:0,y:25,scale:1.025}} animate={{opacity:1,y:0,scale:1}} transition={{duration:1.35,ease:[.16,1,.3,1]}} fetchPriority="high"/>
    <div className="restored-hero-shade"/>
    <div className="restored-hero-topline"><span><i/> A SEASON IN BLOOM</span><span>PHOTOGRAPHY / MOVING IMAGE</span></div>
    <motion.div className="restored-hero-copy" initial={reduced?false:{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:1,ease:[.16,1,.3,1]}}><span>A COLLECTION BY SAHIL KARN</span><h1 id="restored-hero-title" aria-label="The world, between moments.">The world,<br/>between<br/><em>moments.</em></h1><p>A little spring. A little stillness.<br/>Photographs and films from the moments we keep.</p><div className="restored-hero-actions"><a href="#room-nature">Explore Nature <span>→</span></a><button onClick={onFilm}><span className="hero-play-symbol">▶</span> Watch a film</button></div></motion.div>
    <div className="spring-opening-note"><span>THE FIRST STUDY / NATURE</span><p>There is no hurry<br/>in this light.</p></div>
    <div className="restored-hero-bottom"><a href="#room-nature">SCROLL INTO SPRING <span>↓</span></a><span className="spring-frame-credit">THE BLOSSOM STUDY / SAHIL KARN</span></div>
  </section>;
}
