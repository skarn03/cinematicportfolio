export type AtmosphereMode = 'fireflies'|'dust'|'petals'|'silver'|'projector'|'leaves'|'embers'|'stars'|'sakura';
export type RoomAtmosphere = {name:string;mode:AtmosphereMode;color:[number,number,number];speed:number;wash:string};
export const roomAtmospheres: Record<string,RoomAtmosphere> = {
  home:{name:'The opening / fireflies',mode:'fireflies',color:[220,210,143],speed:.14,wash:'#b6bc6c'},
  opening:{name:'The foyer / sunlit dust',mode:'dust',color:[230,207,161],speed:.11,wash:'#b99862'},
  work:{name:'Selected works / drifting petals',mode:'petals',color:[192,203,158],speed:.17,wash:'#a5b487'},
  archive:{name:'The complete collection / silver dust',mode:'silver',color:[201,210,205],speed:.09,wash:'#a1b1ab'},
  film:{name:'The screening room / projector dust',mode:'projector',color:[221,208,173],speed:.24,wash:'#a29a70'},
  about:{name:'Behind the frame / leaves',mode:'leaves',color:[172,188,134],speed:.16,wash:'#8eaa70'},
  collaborate:{name:'The studio / rising embers',mode:'embers',color:[237,176,112],speed:.27,wash:'#b78450'},
  contact:{name:'The last room / stars',mode:'stars',color:[183,208,223],speed:.04,wash:'#7da3b5'},
};
