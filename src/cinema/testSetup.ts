import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

Object.defineProperty(window,'matchMedia',{writable:true,value:vi.fn((query:string)=>({matches:query.includes('prefers-reduced-motion'),media:query,onchange:null,addListener:vi.fn(),removeListener:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn(),dispatchEvent:vi.fn()}))});
class ObserverMock {
  active=true;
  readonly root=null;readonly rootMargin='';readonly thresholds=[];
  callback:IntersectionObserverCallback;
  constructor(callback:IntersectionObserverCallback){this.callback=callback;}
  observe(element:Element){this.active=true;queueMicrotask(()=>{if(this.active)this.callback([{target:element,isIntersecting:true,intersectionRatio:1,boundingClientRect:element.getBoundingClientRect(),intersectionRect:element.getBoundingClientRect(),rootBounds:null,time:0}],this as unknown as IntersectionObserver);});}
  unobserve(){} disconnect(){this.active=false;} takeRecords(){return[];}
}
vi.stubGlobal('IntersectionObserver',ObserverMock);
Object.defineProperty(HTMLDialogElement.prototype,'showModal',{value:function(this:HTMLDialogElement){this.setAttribute('open','');}});
Object.defineProperty(HTMLDialogElement.prototype,'close',{value:function(this:HTMLDialogElement){this.removeAttribute('open');}});
Element.prototype.scrollIntoView=vi.fn();
Element.prototype.scrollTo=vi.fn();
window.scrollTo=vi.fn();
beforeEach(()=>{window.history.replaceState(null,'','/');localStorage.removeItem('cinematic-gallery-theme');document.documentElement.dataset.theme='light';});
afterEach(()=>{cleanup();vi.clearAllMocks();});
