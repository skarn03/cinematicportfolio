import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export default function ScrollReveal({children,className='',direction='up',delay=0}:{children:ReactNode;className?:string;direction?:'up'|'left'|'right'|'scale';delay?:number}) {
  const reduced=useReducedMotion();
  const entrance={opacity:0,x:direction==='left'?-35:direction==='right'?35:0,y:direction==='up'?35:0,scale:direction==='scale'?.96:1,filter:'blur(4px)'};
  return <motion.div className={`exhibition-reveal ${className}`} initial={reduced?false:entrance} whileInView={{opacity:1,x:0,y:0,scale:1,filter:'blur(0px)'}} viewport={{once:true,amount:.08,margin:'0px 0px -25px 0px'}} transition={{duration:.9,delay:reduced?0:delay,ease:[.16,1,.3,1]}}>{children}</motion.div>;
}
