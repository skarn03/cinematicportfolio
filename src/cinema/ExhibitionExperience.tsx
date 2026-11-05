import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { categories, frame, frames } from './catalog';
import type { Category } from './catalog';
import GalleryRoom from './GalleryRoom';
import RoomAtmosphere from './RoomAtmosphere';
import GalleryCursor from './GalleryCursor';
import type { Panel } from './ExhibitionPanel';
import './exhibition.css';
import { CinematicOpening, PortfolioHeader } from './CinematicOpening';
import PortfolioSections from './PortfolioSections';
import Reveal from './ScrollReveal';
import './restored-sections.css';
import './chromatic-gallery.css';
import './exhibit-layouts.css';
import './final-polish.css';
import type { GalleryTheme } from './ThemeToggle';
import './spring-gallery.css';
import './exhibit-rhythm.css';

const FullscreenViewer=lazy(()=>import('./FullscreenViewer'));
const ExhibitionPanel=lazy(()=>import('./ExhibitionPanel'));
const FilmDialog=lazy(()=>import('./MediaDialog').then(module=>({default:module.FilmDialog})));
const roomNotes:Record<string,string>={Streets:'The lives that pass us by.',People:'A little closer. A little more human.',Nature:'Let the world slow down.',Quiet:'A pause, held in a frame.','After dark':'Stay for the last light.',Studio:'Studies, experiments, and the work around the work.'};
const atmosphereRooms:Record<string,string>={Streets:'work',People:'opening',Nature:'about',Quiet:'archive','After dark':'contact',Studio:'collaborate'};
const roomId=(category:string)=>`room-${category.toLowerCase().replaceAll(' ','-')}`;
const initialPanel=():Panel|'film'|null=>{const hash=window.location.hash.slice(1);return hash==='index'?'index':hash==='watch'?'film':null;};

export default function ExhibitionExperience() {
  const reduced=useReducedMotion();
  const [panel,setPanel]=useState<Panel|'film'|null>(initialPanel);
  const [viewer,setViewer]=useState<{id:string;category:Category}|null>(null);
  const [active,setActive]=useState('home');
  const [paused,setPaused]=useState(false);
  const [portfolioFullscreen,setPortfolioFullscreen]=useState(false);
  useEffect(()=>{const sync=()=>setPortfolioFullscreen(!!document.fullscreenElement);document.addEventListener('fullscreenchange',sync);return()=>document.removeEventListener('fullscreenchange',sync);},[]);
  function togglePortfolioFullscreen(){if(document.fullscreenElement)void document.exitFullscreen?.();else void document.documentElement.requestFullscreen?.().catch(()=>{});}
  const [theme,setTheme]=useState<GalleryTheme>(()=>{try{return window.localStorage.getItem('cinematic-gallery-theme')==='dark'?'dark':'light';}catch{return 'light';}});
  useEffect(()=>{document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='light'?'#e9e3d8':'#0d100f');try{window.localStorage.setItem('cinematic-gallery-theme',theme);}catch{}},[theme]);
  const [heroPhoto,setHeroPhoto]=useState('bloom-pond-figure');
  const [roomPhotos,setRoomPhotos]=useState<Record<string,string>>({});
  const notePhoto=useCallback((room:string,id:string)=>setRoomPhotos(current=>current[room]===id?current:{...current,[room]:id}),[]);
  const fullscreenOwned=useRef(false);
  const lenis=useRef<Lenis|null>(null);
  const rooms=useMemo(()=>categories.filter(category=>category!=='All').map((category,index)=>({id:roomId(category),category,number:String(index+1).padStart(2,'0'),photos:frames.filter(photo=>photo.category===category)})),[]);
  const activeRoom=rooms.find(room=>room.id===active);
  const atmosphere=activeRoom?atmosphereRooms[activeRoom.category]:['home','film','about','collaborate','contact'].includes(active)?active:'archive';
  const currentPhoto=activeRoom?frame(roomPhotos[activeRoom.id]||activeRoom.photos[0].id):active==='home'?frame(heroPhoto):active==='about'?frame('green-canopy'):active==='contact'?frame('city-after-hours'):null;
  useEffect(()=>{
    if(reduced)return;
    const instance=new Lenis({duration:1.05,easing:t=>1-Math.pow(1-t,3),smoothWheel:true,anchors:true,autoRaf:true,prevent:node=>!!node.closest('[data-lenis-prevent]')});
    lenis.current=instance;return()=>{instance.destroy();lenis.current=null;};
  },[reduced]);
  useEffect(()=>{if(panel||viewer)lenis.current?.stop();else lenis.current?.start();},[panel,viewer]);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive((entry.target as HTMLElement).dataset.roomTarget||entry.target.id);},{rootMargin:'-35% 0px -45% 0px'});
    document.querySelectorAll('[data-exhibition-room]').forEach(room=>observer.observe(room));
    const route=()=>setPanel(initialPanel());window.addEventListener('hashchange',route);
    return()=>{observer.disconnect();window.removeEventListener('hashchange',route);};
  },[]);
  function openPanel(next:Panel|'film'){setPanel(next);window.history.replaceState(null,'',`#${next==='film'?'watch':next}`);}
  function closePanel(){setPanel(null);window.history.replaceState(null,'',`#${active}`);}
  function visit(category:Category){closePanel();requestAnimationFrame(()=>{const target=document.getElementById(roomId(category));if(target)target.scrollIntoView({behavior:reduced?'instant':'smooth'});});}
  function navigateTo(id:string){
    const target=document.getElementById(id);
    if(!target)return;
    window.history.pushState(null,'',`#${id}`);
    const top=target.getBoundingClientRect().top+window.scrollY-100;
    if(lenis.current&&!reduced){lenis.current.scrollTo(top,{duration:1.15,lock:true,force:true});}
    else window.scrollTo({top:Math.max(0,top),behavior:reduced?'auto':'smooth'});
  }
  function openPhoto(id:string,category:Category){
    setViewer({id,category});
    if(!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().then(()=>{fullscreenOwned.current=true;}).catch(()=>{});
  }
  function closeViewer(){setViewer(null);if(fullscreenOwned.current){fullscreenOwned.current=false;if(document.fullscreenElement)void document.exitFullscreen?.().catch(()=>{});}}
  useEffect(()=>{const changed=()=>{if(fullscreenOwned.current&&!document.fullscreenElement){fullscreenOwned.current=false;setViewer(null);}};document.addEventListener('fullscreenchange',changed);return()=>document.removeEventListener('fullscreenchange',changed);},[]);
  return <div className="exhibition-experience" data-active-room={active} data-theme={theme}>
    <a href="#room-nature" className="exhibition-skip">Skip to the photographs</a>
    <RoomAtmosphere room={atmosphere} photo={currentPhoto} paused={paused||!!panel||!!viewer} onToggle={()=>setPaused(!paused)}/><GalleryCursor/>
    <PortfolioHeader active={active} theme={theme} onThemeToggle={()=>setTheme(theme==='light'?'dark':'light')} onNavigate={navigateTo} fullscreen={portfolioFullscreen} onToggleFullscreen={togglePortfolioFullscreen}/>
    <main className="exhibition-flow">
      <CinematicOpening onFilm={()=>openPanel('film')} onFrameChange={setHeroPhoto}/>
      <section id="work" className="portfolio-photographs" aria-labelledby="photographs-heading"><Reveal className="portfolio-section-heading portfolio-page-width"><div><span>01 / THE COMPLETE COLLECTION</span><h2 id="photographs-heading">Photographs.<br/><em>A world of stories.</em></h2></div><div><p>All {frames.length} photographs. Every original, every new frame.<br/>Three or four frames at a time. More unfold as you scroll.</p><button className="photography-index-link" onClick={()=>openPanel('index')}>Index <span>{frames.length}</span></button></div></Reveal>
      {rooms.map(room=><div key={room.id} data-exhibition-room id={`${room.id}-observer`} className="room-observer" data-room-target={room.id}><GalleryRoom id={room.id} number={room.number} title={room.category} subtitle={roomNotes[room.category]} photos={room.photos} onActivePhoto={notePhoto} onOpen={id=>openPhoto(id,room.category)}/></div>)}
      </section>
      <PortfolioSections onFilm={()=>openPanel('film')} onPhoto={id=>openPhoto(id,frame(id).category)}/>
    </main>
    <div className="exhibition-location" aria-live="polite"><span>{active==='home'?'PROLOGUE':active==='epilogue'?'EPILOGUE':`${activeRoom?.number||'01'} / ${String(rooms.length).padStart(2,'0')}`}</span><span>{activeRoom?.category||({home:'Introduction',film:'Film',about:'About',collaborate:'Work with me',contact:'Contact'}[active]||'Photographs')}</span></div>
    <Suspense fallback={<div className="exhibition-loading" role="status">Opening…</div>}>
      {viewer&&<FullscreenViewer id={viewer.id} category={viewer.category} paused={paused} onToggle={()=>setPaused(!paused)} onClose={closeViewer}/>}
      {panel==='film'&&<FilmDialog onClose={closePanel}/>}
      {panel&&panel!=='film'&&<ExhibitionPanel key={panel} panel={panel} onClose={closePanel} onRoom={visit} onBrowse={()=>{closePanel();openPhoto(frames[0].id,'All');}}/>}
    </Suspense>
  </div>;
}
