import { useEffect, useRef, useState } from 'react';

type Player = {destroy:()=>void};
type PlayerApi = {Player:new (element:HTMLIFrameElement,options:{events:{onReady:()=>void;onError:(event:{data:number})=>void}})=>Player};
declare global {
  interface Window {YT?:PlayerApi;onYouTubeIframeAPIReady?:()=>void;}
}
let apiReady:Promise<PlayerApi>|null=null;
function loadPlayerApi():Promise<PlayerApi> {
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(apiReady)return apiReady;
  apiReady=new Promise((resolve,reject)=>{
    const previous=window.onYouTubeIframeAPIReady;
    const timeout=window.setTimeout(()=>reject(new Error('Player service could not be reached')),12000);
    window.onYouTubeIframeAPIReady=()=>{previous?.();clearTimeout(timeout);if(window.YT)resolve(window.YT);else reject(new Error('Player unavailable'));};
    if(!document.querySelector('script[data-gallery-youtube]')){const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.dataset.galleryYoutube='true';script.onerror=()=>{clearTimeout(timeout);reject(new Error('Player blocked'));};document.head.appendChild(script);}
  });
  return apiReady;
}

export default function FilmPlayer({videoId,title}:{videoId:string;title:string}) {
  const iframe=useRef<HTMLIFrameElement>(null);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [retry,setRetry]=useState(0);
  const [errorCode,setErrorCode]=useState<number|null>(null);
  const src=`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
  useEffect(()=>{
    let alive=true;let player:Player|undefined;
    const playbackTimeout=window.setTimeout(()=>{if(alive)setStatus('error');},18000);
    loadPlayerApi().then(api=>{if(!alive||!iframe.current)return;player=new api.Player(iframe.current,{events:{onReady:()=>{clearTimeout(playbackTimeout);if(alive)setStatus('ready');},onError:event=>{clearTimeout(playbackTimeout);if(alive){setErrorCode(event.data);setStatus('error');}}}});}).catch(()=>{clearTimeout(playbackTimeout);if(alive)setStatus('error');});
    return()=>{alive=false;clearTimeout(playbackTimeout);player?.destroy();};
  },[retry]);
  return <div className="gallery-film-player"><iframe key={retry} ref={iframe} src={src} title={title} referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowFullScreen/>{status==='loading'&&<span className="film-loading" role="status">Preparing the screening…</span>}{status==='error'&&<div className="film-error" role="status"><span className="micro">THE SCREENING ROOM</span><h3>Let's watch it on YouTube.</h3><p>{errorCode===101||errorCode===150?'This film cannot play inside an embedded player.':'The embedded player could not start in this browser.'}</p><a className="cinema-button accent" href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener">Watch {title} ↗</a><button onClick={()=>{apiReady=null;setStatus('loading');setErrorCode(null);setRetry(retry+1);}}>Try the player again</button></div>}</div>;
}
