import { useEffect, useRef, useState } from 'react';
import { categories, frames, featuredFilm } from './catalog';
import type { Category } from './catalog';
import FilmPlayer from './FilmPlayer';

export type GalleryRequest = {category:Category; id?:string};

export function GalleryDialog({ request,onClose }: {request:GalleryRequest;onClose:()=>void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [category,setCategory] = useState<Category>(request.category);
  const [index,setIndex] = useState(() => Math.max(0,frames.filter(photo => request.category==='All'||photo.category===request.category).findIndex(photo => photo.id===request.id)));
  const visible = frames.filter(photo => category === 'All' || photo.category === category);
  const selected = visible[index] || visible[0];
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {element?.close();document.body.style.overflow = previous;};
  },[]);
  function step(direction:number) {setIndex(current => (current+direction+visible.length)%visible.length);}
  return <dialog className="media-dialog gallery-dialog" ref={dialog} onClose={onClose} aria-label="Photography viewer" onKeyDown={event => {if(event.key==='ArrowRight'){event.preventDefault();step(1);}if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}}}>
    <div className="dialog-top"><div><span className="micro">THE PHOTOGRAPHIC ARCHIVE</span><strong>{category === 'All' ? 'Every frame has a place.' : category}</strong></div><button className="dialog-close" onClick={onClose} autoFocus aria-label="Close photography viewer">Close <span>×</span></button></div>
    <div className="gallery-filters" aria-label="Filter photographs">{categories.map(item => <button key={item} aria-pressed={category===item} onClick={() => {setCategory(item);setIndex(0);}}>{item}</button>)}</div>
    <div className="gallery-view"><button className="gallery-arrow previous" onClick={() => step(-1)} aria-label="Previous photograph">←</button><img key={selected.id} src={selected.src} alt={selected.description} style={{objectPosition:selected.position}}/><button className="gallery-arrow next" onClick={() => step(1)} aria-label="Next photograph">→</button></div>
    <div className="gallery-caption" aria-live="polite"><div><span className="micro">{selected.category} / {String(index+1).padStart(2,'0')} OF {visible.length}</span><h2>{selected.title}</h2></div><a href={selected.src} target="_blank" rel="noopener">Open full image ↗</a></div>
    <div className="gallery-thumbs" aria-label="Choose a photograph">{visible.map((photo,i) => <button key={photo.id} aria-label={`View ${photo.title}`} aria-pressed={i===index} onClick={() => setIndex(i)}><img src={photo.thumbnail} alt="" loading="lazy"/></button>)}</div>
  </dialog>;
}

export function FilmDialog({ onClose }: {onClose:()=>void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [play,setPlay] = useState(false);
  useEffect(() => {
    const element=dialog.current;
    element?.showModal();
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return () => {element?.close();document.body.style.overflow=previous;};
  },[]);
  return <dialog className="media-dialog film-dialog" ref={dialog} onClose={onClose} aria-label={featuredFilm.title}>
    <div className="dialog-top"><div><span className="micro">A FILM BY {featuredFilm.channel}</span><strong>{featuredFilm.title}</strong></div><button className="dialog-close" onClick={onClose} autoFocus>Close <span>×</span></button></div>
    <div className="film-player">{play ? <FilmPlayer videoId={featuredFilm.youtubeId} title={featuredFilm.title}/> : <button onClick={() => setPlay(true)} className="film-consent"><img src={featuredFilm.poster} alt="Poster for A Cinematic New York"/><span><i>▶</i>Play film<small>Loads the YouTube player</small></span></button>}</div>
    <div className="film-player-footer"><span>If playback is unavailable here, open the film on YouTube.</span><a href={`https://www.youtube.com/watch?v=${featuredFilm.youtubeId}`} target="_blank" rel="noopener">Watch on YouTube ↗</a></div>
  </dialog>;
}
