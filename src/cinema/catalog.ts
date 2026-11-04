import importedPhotos from '../data/newPhotos.json';
import { photos as originalPhotos, films } from '../data/media';
import { sequenceByColor } from './colorCurator';

export const categories = ['All', 'Nature', 'People', 'Streets', 'Quiet', 'After dark'] as const;
export type Category = typeof categories[number] | 'Studio';
export type Frame = {
  id: string; title: string; description: string;
  category: Exclude<Category, 'All'>;
  src: string; thumbnail: string; position?: string;
  source: 'Original collection'|'New collection'; sourceName:string; aspect:number;
  fullSrc?:string;srcSet?:string;
};
const oldCategories = {bloom:'Nature',reflections:'Nature',wander:'Nature',streets:'Streets',durbar:'Streets',people:'People',quiet:'Quiet',dusk:'After dark'} as const;
const newFrames: Frame[] = importedPhotos.filter(photo=>!photo.id.startsWith('new-screenshot-')).map(photo => ({...photo,category:photo.category as Frame['category'],source:'New collection',aspect:photo.width/photo.height}));
const archiveFrames: Frame[] = originalPhotos.map(photo => ({id:photo.id,title:photo.title,description:photo.story,category:photo.id==='bloom-canopy-sky'?'Quiet':oldCategories[photo.chapter],src:photo.src,thumbnail:`/photos/original-thumb-${photo.id}.webp`,position:photo.focalPoint,source:'Original collection',sourceName:photo.id,aspect:photo.aspect}));
export const blossomIds=['bloom-tree-gaze-a','bloom-blossom-in-hand','forest-companions','river-pause','bloom-pond-figure'];
const allPhotographs=[...newFrames,...archiveFrames];
export const frames=categories.filter(category=>category!=='All').flatMap(category=>{
  const ordered=sequenceByColor(allPhotographs.filter(photo=>photo.category===category));
  return category==='Nature'?[...blossomIds.map(id=>ordered.find(photo=>photo.id===id)!).filter(Boolean),...ordered.filter(photo=>!blossomIds.includes(photo.id))]:ordered;
});
export const frame = (id: string): Frame => {
  const found = frames.find(photo => photo.id === id);
  if (!found) throw new Error(`Missing portfolio photograph: ${id}`);
  return found;
};
export const collections: {category:Frame['category']; title:string; subtitle:string; cover:string; position?:string}[] = [
  {category:'Streets',title:'Life in passing',subtitle:'People, places & the spaces between.',cover:'red-backpack',position:'50% 50%'},
  {category:'People',title:'A little closer',subtitle:'Portraits with a sense of presence.',cover:'lamplight-portrait',position:'55% 45%'},
  {category:'Nature',title:'The slower hours',subtitle:'Open air. A different pace.',cover:'forest-companions',position:'50% 50%'},
  {category:'After dark',title:'When the light changes',subtitle:'The city, after sunset.',cover:'night-portrait',position:'50% 45%'},
];
export const featuredFilm = films[0];
