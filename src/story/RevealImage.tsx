import { useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";

/**
 * A photograph clarifying into focus as it scrolls into view, then softening
 * back out as it leaves — blurred and desaturated at both edges of the
 * viewport, sharp only while it's actually in front of the visitor. The
 * generalized version of the "developing photograph" idea every chapter
 * leans on. Pass `onClick` to make it open in the shared lightbox.
 */
export default function RevealImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const blur = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [16, 0, 0, 16]);
  const sat = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1.08, 1, 1, 1.08]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [28, 0, 0, -28]);
  const filter = useMotionTemplate`blur(${blur}px) saturate(${sat})`;

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      data-cursor-hover={onClick ? true : undefined}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover ${imgClassName}`}
        style={{ filter, scale, y }}
      />
    </div>
  );
}
