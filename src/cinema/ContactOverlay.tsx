import { useEffect, useRef, useState } from 'react';
import { frame } from './catalog';
import { contactLinks, mailtoHref } from '../data/contact';

export default function ContactOverlay({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const [kind, setKind] = useState('Photography');
  const [idea, setIdea] = useState('');
  const instagram = contactLinks.socials.find(social => social.icon === 'instagram' && social.url);
  const photograph = frame('city-after-hours');

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function sendBrief(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = `${kind} inquiry${name.trim() ? ` from ${name.trim()}` : ''}`;
    const body = `Hi Sahil,\n\n${idea.trim()}\n\n${name.trim()}`;
    window.location.href = `mailto:${contactLinks.email}?${new URLSearchParams({ subject, body }).toString()}`;
  }

  return <dialog ref={dialog} className="contact-overlay" aria-labelledby="contact-overlay-title" onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} data-lenis-prevent>
    <div className="contact-overlay-panel">
      <div className="contact-overlay-art" aria-hidden="true">
        <img src={photograph.src} alt="" />
        <div className="contact-overlay-art-shade" />
        <span className="contact-overlay-art-index">SAHIL KARN / FRAME 01</span>
        <p>Good work begins<br />with a conversation.</p>
        <span className="contact-overlay-art-caption">PHOTOGRAPHY &amp; FILMMAKING</span>
      </div>
      <div className="contact-overlay-content">
        <button className="contact-overlay-close" onClick={onClose} aria-label="Close contact overlay">Close <span aria-hidden="true">×</span></button>
        <div className="contact-overlay-heading"><span className="contact-overlay-kicker"><i /> OPEN FOR CREATIVE COLLABORATIONS</span><h2 id="contact-overlay-title">Let’s make<br /><em>something felt.</em></h2><p>Have a place, person, or story in mind? Tell me what you’re imagining.</p></div>
        <form className="contact-overlay-form" onSubmit={sendBrief}>
          <div className="contact-overlay-fields"><label>Your name<input value={name} onChange={event => setName(event.target.value)} placeholder="What should I call you?" /></label><label>Project type<select value={kind} onChange={event => setKind(event.target.value)}><option>Photography</option><option>Film</option><option>Creative collaboration</option><option>Something else</option></select></label></div>
          <label>Tell me a little about it<textarea required value={idea} onChange={event => setIdea(event.target.value)} placeholder="The story, the place, the feeling…" rows={3} /></label>
          <button className="contact-overlay-send" type="submit">Start a conversation <span aria-hidden="true">↗</span></button>
        </form>
        <div className="contact-overlay-direct"><span>OR REACH ME DIRECTLY</span><div><a href={mailtoHref()}>{contactLinks.email} <span aria-hidden="true">↗</span></a>{instagram && <a href={instagram.url} target="_blank" rel="noopener noreferrer">Instagram / {instagram.handle} <span aria-hidden="true">↗</span></a>}</div></div>
      </div>
    </div>
  </dialog>;
}
