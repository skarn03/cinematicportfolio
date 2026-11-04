import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { categories, frames } from './catalog';
import type { Category } from './catalog';
import type { GalleryRequest } from './MediaDialog';
import ScrollReveal from './ScrollReveal';

export default function CompleteCollection({onOpen}:{onOpen:(request:GalleryRequest)=>void}) {
  const [category,setCategory]=useState<Category>('All');
  const [source,setSource]=useState('All collections');
  const originals=frames.filter(photo=>photo.source==='Original collection').length;
  const visible=useMemo(()=>frames.filter(photo=>(category==='All'||category===photo.category)&&(source==='All collections'||source===photo.source)),[category,source]);
  return <section id="archive" className="complete-collection" aria-labelledby="complete-collection-heading"><div className="page-width">
    <ScrollReveal className="exhibition-heading"><span className="section-marker">THE COLLECTION WALL / EVERY FRAME</span><h2 id="complete-collection-heading">Nothing left<br/><span>out of the picture.</span></h2><p>All {originals} images from the original portfolio. All {frames.length-originals} from the new collection. Every alternate edit, too.</p></ScrollReveal>
    <div className="exhibition-filters"><div className="exhibition-sources" aria-label="Choose image source">{['All collections','Original collection','New collection'].map(item=><button key={item} aria-pressed={source===item} onClick={()=>setSource(item)}>{item}<span>{item==='All collections'?frames.length:frames.filter(photo=>photo.source===item).length}</span></button>)}</div><div className="exhibition-categories" aria-label="Choose image subject">{categories.map(item=><button key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div><p role="status">{visible.length} {visible.length===1?'piece':'pieces'} on this wall</p></div>
    <div className="exhibition-wall" aria-label="Complete image collection">{visible.map((photo,index)=><ScrollReveal key={photo.id} className="exhibition-piece" direction={index%3===0?'left':index%3===2?'right':'up'} delay={(index%3)*.055}><button className="exhibition-print" aria-label={`View ${photo.title}, ${photo.sourceName}`} onClick={()=>onOpen({category:photo.category,id:photo.id})}><div className="print-mat" style={{'--print-ratio':photo.aspect} as CSSProperties}><img src={photo.thumbnail} alt={photo.description} loading="lazy" decoding="async" style={{aspectRatio:photo.aspect,objectPosition:photo.position}}/><span className="print-open" aria-hidden="true">↗</span></div><div className="museum-caption"><span className="exhibit-id">{String(frames.findIndex(frame=>frame.id===photo.id)+1).padStart(3,'0')}</span><div><h3>{photo.title}</h3><p>{photo.source} · {photo.category}</p></div></div></button></ScrollReveal>)}</div>
    {!visible.length&&<p className="exhibition-empty">No pieces in this room yet. Choose another subject or collection.</p>}
    <div className="exhibition-end"><span>YOU'VE REACHED THE END OF THIS WALL.</span><button onClick={()=>onOpen({category:'All'})}>View the complete collection full screen ↗</button></div>
  </div></section>;
}
