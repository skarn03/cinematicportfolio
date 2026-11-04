import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ExhibitionExperience from './ExhibitionExperience';
import FullscreenViewer from './FullscreenViewer';
import FilmPlayer from './FilmPlayer';
import { frames } from './catalog';
import { makeExhibitSequence } from './exhibitSequence';
import { frame } from './catalog';
import { colorProfileFor, sequenceByColor, sequenceCost } from './colorCurator';
import { photoAtmosphere } from './photoAtmosphere';
import RoomAtmosphere from './RoomAtmosphere';
import GalleryRoom from './GalleryRoom';
import EditorialRoom from './EditorialRoom';
import newPhotos from '../data/newPhotos.json';
import { photos as originalPhotos } from '../data/media';

describe('the complete exhibition',()=>{
  it('retains the complete collection while initially showing only a staged selection',async()=>{
    const {container}=render(<ExhibitionExperience/>);
    expect(screen.getByRole('heading',{level:1})).toBeInTheDocument();
    const prints=container.querySelectorAll('.sequence-print');
    expect(prints.length).toBeGreaterThan(0);
    expect(prints.length).toBeLessThan(128);
    expect(new Set([...prints].map(print=>print.getAttribute('data-image-id'))).size).toBe(prints.length);
    expect(frames.filter(photo=>photo.source==='Original collection')).toHaveLength(61);
    expect(frames.filter(photo=>photo.source==='New collection')).toHaveLength(67);
    expect(container.querySelectorAll('.gallery-room')).toHaveLength(5);
    expect(frames.some(photo=>photo.id.startsWith('new-screenshot-'))).toBe(false);
    expect(screen.getByRole('button',{name:'Pause gallery atmosphere'})).toBeDisabled();
  });
  it('opens the index and lets visitors view all images in one continuous sequence',async()=>{
    render(<ExhibitionExperience/>);
    fireEvent.click(screen.getByRole('button',{name:/Index 128/}));
    await screen.findByRole('dialog',{name:'Exhibition index'});
    fireEvent.click(screen.getByRole('button',{name:/View all 128 images in sequence/}));
    await screen.findByRole('dialog',{name:'Full-screen photography viewer'});
    expect(screen.getByRole('heading',{name:frames[0].title})).toBeVisible();
    fireEvent.keyDown(screen.getByRole('dialog'),{key:'End'});
    expect(screen.getByRole('heading',{name:frames.at(-1)!.title})).toBeVisible();
    fireEvent.click(screen.getByRole('button',{name:'Next photograph'}));
    expect(screen.getByRole('heading',{name:frames[0].title})).toBeVisible();
    fireEvent.click(screen.getByRole('button',{name:'Close full-screen viewer'}));
    await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('provides direct email, the corrected Instagram account, and a working project brief',async()=>{
    render(<ExhibitionExperience/>);
    expect(screen.getByRole('link',{name:'Contact'})).toHaveAttribute('href','#contact');
    await screen.findByRole('heading',{name:/Let's make/});
    expect(screen.getByRole('link',{name:/saikacinematics@gmail.com/})).toHaveAttribute('href','mailto:saikacinematics@gmail.com');
    expect(screen.getByRole('link',{name:/Instagram/})).toHaveAttribute('href','https://www.instagram.com/saika_cinematics/');
    fireEvent.change(screen.getByLabelText("I'm interested in"),{target:{value:'Cinematography'}});
    fireEvent.change(screen.getByLabelText('The idea'),{target:{value:'A short film about the city after sunset.'}});
    expect(screen.getByLabelText('The idea')).toHaveValue('A short film about the city after sunset.');
    expect(screen.getByRole('button',{name:/Email this brief/})).toHaveAttribute('type','submit');
    expect(screen.getByText('Opens your email app with the brief ready to send.')).toBeVisible();
  });
  it('restores visible section navigation and selectable cinematic opening frames',async()=>{
    render(<ExhibitionExperience/>);
    expect(screen.getByRole('navigation',{name:'Portfolio navigation'})).toBeInTheDocument();
    for(const [name,id] of [['Photographs','work'],['Film','film'],['About','about'],['Work with me','collaborate'],['Contact','contact']]){
      expect(screen.getByRole('link',{name:new RegExp(`^${name}`)})).toHaveAttribute('href',`#${id}`);
      expect(document.getElementById(id)).toBeInTheDocument();
    }
    expect(document.querySelector('.restored-hero-image')).toHaveAttribute('src',frame('bloom-pond-figure').src);
    expect(screen.getByRole('heading',{level:1})).toHaveAccessibleName('The world, between moments.');
  });
  it('defaults to warm light mode and persists a visitor theme choice',()=>{
    render(<ExhibitionExperience/>);
    expect(document.documentElement.dataset.theme).toBe('light');
    fireEvent.click(screen.getByRole('button',{name:'Switch to dark mode'}));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('cinematic-gallery-theme')).toBe('dark');
    fireEvent.click(screen.getByRole('button',{name:'Switch to light mode'}));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('distraction-free viewing',()=>{
  it('uses the high-resolution viewer asset rather than a preview thumbnail',()=>{
    const photo=frame('lantern-street');
    render(<FullscreenViewer id={photo.id} onClose={vi.fn()}/>);
    expect(photo.fullSrc).toContain('-large.webp');
    expect(screen.getByAltText(photo.description)).toHaveAttribute('src',photo.fullSrc);
    expect(frames.some(photo=>/lith|screenshot/i.test(photo.title))).toBe(false);
  });
  it('requests browser full screen when an About photograph is opened',async()=>{
    const request=vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement,'requestFullscreen',{configurable:true,value:request});
    try {
      render(<ExhibitionExperience/>);
      fireEvent.click(screen.getByRole('button',{name:'View Under the canopy full screen'}));
      await screen.findByRole('dialog',{name:'Full-screen photography viewer'});
      expect(request).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByRole('button',{name:'Close full-screen viewer'}));
    } finally {Reflect.deleteProperty(document.documentElement,'requestFullscreen');}
  });
  it('preserves details, supports arrow navigation, and reveals a contact sheet on request',async()=>{
    render(<FullscreenViewer id={frames[0].id} onClose={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button',{name:'Details'}));
    expect(screen.getByText(frames[0].description)).toBeVisible();
    fireEvent.click(screen.getByRole('button',{name:'Contact sheet'}));
    expect(screen.getAllByRole('button',{name:/^View /})).toHaveLength(128);
    fireEvent.keyDown(screen.getByRole('dialog'),{key:'ArrowRight'});
    expect(screen.getByRole('heading',{name:frames[1].title})).toBeVisible();
  });
  it('configures the YouTube referrer correctly and shows a usable fallback on playback errors',async()=>{
    let onError:((event:{data:number})=>void)|undefined;
    window.YT={Player:class {constructor(_iframe:HTMLIFrameElement,options:{events:{onReady:()=>void;onError:(event:{data:number})=>void}}){onError=options.events.onError;options.events.onReady();}destroy(){}}};
    render(<FilmPlayer title="A Cinematic New York" videoId="28VrF5UmScc"/>);
    const iframe=screen.getByTitle('A Cinematic New York');
    expect(iframe).toHaveAttribute('referrerpolicy','strict-origin-when-cross-origin');
    expect(iframe.getAttribute('src')).toContain('enablejsapi=1');
    expect(iframe.getAttribute('src')).toContain('origin=');
    await waitFor(()=>expect(onError).toBeDefined());
    onError!({data:150});
    await screen.findByText('This film cannot play inside an embedded player.');
    expect(screen.getByRole('link',{name:/Watch A Cinematic New York/})).toHaveAttribute('href','https://www.youtube.com/watch?v=28VrF5UmScc');
    delete window.YT;
  });
});

describe('color stories and image-specific atmosphere',()=>{
  it('matches neighboring colors while retaining every image and every palette',()=>{
    const before=[...newPhotos,...originalPhotos].map(photo=>({id:photo.id}));
    const ordered=sequenceByColor(before);
    expect(new Set(ordered.map(photo=>photo.id))).toEqual(new Set(before.map(photo=>photo.id)));
    expect(ordered).toHaveLength(130);
    expect(sequenceCost(ordered)).toBeLessThan(sequenceCost(before)*.75);
    expect(frames.every(photo=>colorProfileFor(photo.id).palette.length>=3)).toBe(true);
  });
  it('derives particle color from the photograph and updates it when the photo changes',()=>{
    const first=frame('forest-companions'),next=frame('city-after-hours');
    const {container,rerender}=render(<RoomAtmosphere room="about" photo={first} paused={false} onToggle={vi.fn()}/>);
    expect(container.querySelector('.room-atmosphere')).toHaveAttribute('data-image',first.id);
    expect(photoAtmosphere(first,'about').mode).toBe('sakura');
    rerender(<RoomAtmosphere room="about" photo={next} paused={false} onToggle={vi.fn()}/>);
    expect(container.querySelector('.room-atmosphere')).toHaveAttribute('data-image',next.id);
    expect(photoAtmosphere(next,'about').color).not.toEqual(photoAtmosphere(first,'about').color);
    expect(new Set(frames.map(photo=>photoAtmosphere(photo,'archive').mode)).size).toBeGreaterThan(3);
  });
  it('reports the image in view and adds a quiet original line to selected photographs',async()=>{
    const note=vi.fn();
    const photos=[frame('forest-companions'),frame('rain-on-brick'),frame('city-after-hours')];
    render(<GalleryRoom id="test-room" title="Streets" subtitle="A color story" number="01" photos={photos} onOpen={vi.fn()} onActivePhoto={note}/>);
    expect(screen.getByText('Take the long way. There is light there.')).toBeInTheDocument();
    await waitFor(()=>expect(note).toHaveBeenCalled());
    expect(note.mock.calls.some(call=>call[0]==='test-room')).toBe(true);
  });
});

describe('a varied, progressively revealed gallery',()=>{
  it('reveals four images followed by the featured blossom portrait',()=>{
    const photos=frames.filter(photo=>photo.category==='Nature');
    const open=vi.fn();
    const {container}=render(<EditorialRoom id="journal" title="Nature" number="01" subtitle="Take your time" photos={photos} onOpen={open}/>);
    expect(container.querySelectorAll('.editorial-print')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button',{name:/Reveal the next exhibit/}));
    expect(container.querySelectorAll('.editorial-print')).toHaveLength(5);
    expect(container.querySelector('.solo-exhibit')).toHaveAttribute('data-image-id','bloom-pond-figure');
    expect(container.querySelector('.solo-image-caption blockquote')).toHaveTextContent('There is no hurry in this light.');
    fireEvent.click(container.querySelector('.solo-exhibit button')!);
    expect(open).toHaveBeenCalledWith('bloom-pond-figure');
  });
  it('uses distinct editorial layouts rather than repeating a carousel in every room',()=>{
    const {container}=render(<ExhibitionExperience/>);
    expect(container.querySelector('[data-layout="portrait-pairs"]')).toBeInTheDocument();
    expect(container.querySelector('[data-layout="landscape-journal"]')).toBeInTheDocument();
    expect(container.querySelector('[data-layout="scattered-prints"]')).toBeInTheDocument();
    expect(container.querySelector('[data-layout="night-cinema"]')).toBeInTheDocument();
    expect(container.querySelector('[data-layout="studio-studies"]')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.photograph-sequence')).toHaveLength(0);
  });
  it('varies composition without losing or repeating photographs',()=>{
    const photos=frames.filter(photo=>photo.category==='Nature');
    const sequence=makeExhibitSequence(photos,'Nature');
    expect(sequence.slice(0,6).map(group=>group.photos.length)).toEqual([4,1,3,4,2,1]);
    expect(sequence.flatMap(group=>group.photos.map(photo=>photo.id))).toEqual(photos.map(photo=>photo.id));
    expect(new Set(sequence.map(group=>group.composition)).size).toBe(6);
  });
  it('enlarges an opened photograph and lets visitors fit it again',()=>{
    const photo=frames[0];
    const {container}=render(<FullscreenViewer id={photo.id} onClose={vi.fn()}/>);
    fireEvent.click(screen.getByAltText(photo.description));
    expect(container.querySelector('.viewer-stage')).toHaveAttribute('data-zoomed','true');
    fireEvent.click(screen.getByRole('button',{name:'Fit photograph'}));
    expect(container.querySelector('.viewer-stage')).toHaveAttribute('data-zoomed','false');
  });
});
