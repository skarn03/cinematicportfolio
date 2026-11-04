export type GalleryTheme='light'|'dark';

export default function ThemeToggle({theme,onToggle}:{theme:GalleryTheme;onToggle:()=>void}) {
  return <button className="gallery-theme-toggle" aria-label={theme==='light'?'Switch to dark mode':'Switch to light mode'} aria-pressed={theme==='dark'} onClick={onToggle} title={theme==='light'?'Dark mode':'Light mode'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{theme==='light'?<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></>:<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>}</svg><span>{theme==='light'?'Light':'Dark'}</span></button>;
}
