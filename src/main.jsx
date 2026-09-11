import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

import logo from './assets/logo_new.jpg';
import road from './assets/road_sharp.jpg';
import tank from './assets/tank.jpg';
import city from './assets/city.jpg';
import sunset from './assets/sunset.jpg';
import ride from './assets/ride.jpg';
import gillette from './assets/gillette-subi.jpg';
import aricaSunset from './assets/arica_sunset.jpg';
import coastalRide from './assets/coastal_ride.jpg';
import skull1 from './assets/skull1.jpg';
import skull2 from './assets/skull2.jpg';
import explodedVideo from './assets/gillette-frames/gillette-subi-exploded-new.webm';

const gallery = [
  { src: sunset, title: 'Rodar juntos', text: 'Atardeceres, carretera y kilómetros compartidos.' },
  { src: road, title: 'Sin destino fijo', text: 'La ruta es parte de la historia.' },
  { src: city, title: 'Street life', text: 'La familia también vive la ciudad.' },
  { src: ride, title: 'La máquina', text: 'Custom, carácter y personalidad.' },
  { src: tank, title: 'Detalles', text: 'Cada pieza cuenta una historia.' },
  { src: aricaSunset, title: 'Nuestra Ciudad', text: 'Rodando por Arica al atardecer.' },
  { src: coastalRide, title: 'Ruta', text: 'Ruta en familia' },
];

function App() {
  const [menu, setMenu] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [disassembled, setDisassembled] = useState(false);
  const motoVideoRef = useRef(null);
  const motoSectionRef = useRef(null);
  const EXPLODED_TIME = 5.2;
  const END_TIME = 10;
  const heroRef = useRef(null);
  const motoRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-kicker', { y: 25, opacity: 0, duration: .8, delay: .15 });
      gsap.from('.hero-title span', { y: 80, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out' });
      gsap.from('.hero-copy', { y: 20, opacity: 0, duration: .8, delay: .7 });
      gsap.from('.hero-actions', { y: 20, opacity: 0, duration: .8, delay: .85 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal-up').forEach((elem) => {
        gsap.from(elem, {
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
      });


    });
    return () => ctx.revert();
  }, []);

  const motoCanvasRef = useRef(null);
  const [framesLoaded, setFramesLoaded] = useState(0);
  const framesRef = useRef([]);

  useEffect(() => {
    const video = motoVideoRef.current;
    const canvas = motoCanvasRef.current;
    if (!video || !canvas) return;

    let ctxGSAP;
    const loadFrames = async () => {
      const ctx = canvas.getContext('2d', { alpha: false });
      
      // Optimize: reduce internal resolution by 25% for much faster drawing
      canvas.width = (video.videoWidth || 1920) * 0.75;
      canvas.height = (video.videoHeight || 1080) * 0.75;
      
      // Optimize: 20 FPS is more than enough for a smooth scrub, saves 33% load time
      const fps = 20;
      const totalFrames = Math.floor(EXPLODED_TIME * fps);
      
      for (let i = 0; i <= totalFrames; i++) {
        video.currentTime = i / fps;
        await new Promise(resolve => {
          video.addEventListener('seeked', resolve, { once: true });
        });
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        offscreenCanvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        framesRef.current.push(offscreenCanvas);
        
        // Use requestAnimationFrame to let the UI update and not freeze the browser completely
        await new Promise(resolve => requestAnimationFrame(resolve));
        setFramesLoaded(Math.round((i / totalFrames) * 100));
      }
      
      // Initial draw
      ctx.drawImage(framesRef.current[0], 0, 0);

      // Setup GSAP
      ctxGSAP = gsap.context(() => {
        const proxy = { frame: 0 };
        gsap.to(proxy, {
          frame: totalFrames,
          ease: 'none',
          scrollTrigger: {
            trigger: motoSectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            onUpdate: (self) => {
              const frameIdx = Math.min(Math.round(proxy.frame), totalFrames);
              if (framesRef.current[frameIdx]) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(framesRef.current[frameIdx], 0, 0);
              }
              setDisassembled(self.progress > 0.85);
            }
          }
        });
      });
    };

    if (video.readyState >= 2) {
      loadFrames();
    } else {
      video.addEventListener('loadeddata', loadFrames, { once: true });
    }

    const onScroll = () => {
      const y = window.scrollY;
      if (heroRef.current) heroRef.current.style.setProperty('--parallax', `${Math.round(y * 0.16)}px`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (ctxGSAP) ctxGSAP.revert();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);



  const scrollTo = (id) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const galleryRef = useRef(null);

  const scrollGallery = (dir) => {
    if (galleryRef.current) {
      const scrollAmount = galleryRef.current.offsetWidth * 0.75;
      galleryRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (galleryRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = galleryRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          galleryRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const scrollAmount = galleryRef.current.offsetWidth * 0.75;
          galleryRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="site">
      <header className="nav">
        <button className="brand" onClick={() => scrollTo('inicio')} aria-label="Ir al inicio">
          <span className="brand-mark">SF</span><span>STREET FAMILY</span>
        </button>
        <nav className={menu ? 'nav-links open' : 'nav-links'}>
          <button onClick={() => scrollTo('club')}>CLUB</button>
          <button onClick={() => scrollTo('gillette')}>HONDA STEED · GILLETTE SUBI</button>
          <button onClick={() => scrollTo('galeria')}>GALERÍA</button>
          <button onClick={() => scrollTo('contacto')}>CONTACTO</button>
        </nav>
        <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Abrir menú">☰</button>
      </header>

      <main>
        <section id="inicio" className="hero" ref={heroRef}>
          {gallery.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="hero-image"
              style={{
                backgroundImage: `url(${item.src})`,
                opacity: idx === heroIndex ? 1 : 0,
                transition: 'opacity 1s ease-in-out'
              }}
            />
          ))}
          <div className="hero-overlay" />
          <div className="hero-content" style={{position: 'relative', zIndex: 1}}>
            <div className="hero-kicker"><span /> MOTO GROUP · ARICA <span /></div>
            <h1 className="hero-title"><span>STREET</span><span>FAMILY</span></h1>
            <p className="hero-copy">CUSTOM · BROTHERHOOD · ROAD</p>
          </div>
          <div className="hero-scroll">SCROLL <span>↓</span></div>
        </section>

        <section id="club" className="intro section-pad">
          <div className="intro-bg" style={{ backgroundImage: `url(${tank})` }} />
          <div className="intro-overlay" />
          <div className="intro-content">
            <div className="section-label reveal-up">01 / EL CLUB</div>
            <div className="intro-grid">
              <div className="logo-wrap reveal-up">
                <div className="logo-glow" />
                <img src={logo} alt="Logo Street Family Moto Group" />
                <span className="logo-ring" />
              </div>
              <div className="intro-copy reveal-up" style={{position: 'relative', zIndex: 1}}>
                <img src={skull2} style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'clamp(280px, 40vw, 600px)', opacity: 0.7, zIndex: -1, pointerEvents: 'none', mixBlendMode: 'screen', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)', maskImage: 'radial-gradient(circle, black 40%, transparent 70%)'}} alt="" />
                <p className="eyebrow">UNA FAMILIA SOBRE DOS RUEDAS</p>
                <h2>NO SE TRATA SOLO<br /><em>DE MOTOS.</em></h2>
                <p>Street Family nace de la pasión por las motocicletas, la personalización y la carretera. Un grupo donde cada máquina tiene personalidad y cada salida suma una historia.</p>
                <div className="stats"><div><strong>01</strong><span>FAMILIA</span></div><div><strong>∞</strong><span>KILÓMETROS</span></div><div><strong>24/7</strong><span>PASIÓN</span></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="gillette" className="moto-section" ref={motoSectionRef}>
          <div className="moto-sticky">
            <div className="section-label reveal-up">02 / CUSTOM BUILD</div>
            <div className="moto-heading reveal-up">
              <div><h2>HONDA <em>STEED</em></h2></div>
              <p>Una custom con identidad propia.</p>
            </div>
            <div className="moto-stage moto-stage-video reveal-up">
              <div className="moto-glow" />
              <div className="moto-note">
                * Interactúa con el control para explorar el ensamblaje custom de la Gillette Subi.
              </div>
              <div className="moto-grid" />
              <div className="moto-image-wrap" ref={motoRef}>
                <video
                  ref={motoVideoRef}
                  src={explodedVideo}
                  muted
                  playsInline
                  preload="auto"
                  style={{ display: 'none' }}
                />
                <canvas 
                  ref={motoCanvasRef} 
                  className="moto-video moto-frame" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: framesLoaded < 100 ? 0 : 1, transition: 'opacity 0.5s ease' }}
                />
                {framesLoaded < 100 && (
                  <div className="moto-loader">
                    <div className="loader-text">CALIBRANDO MÁQUINA</div>
                    <div className="loader-bar">
                      <div className="loader-fill" style={{ width: `${framesLoaded}%` }} />
                    </div>
                    <div className="loader-pct">{framesLoaded}%</div>
                  </div>
                )}
                <div className="scanline" />
              </div>
              <div className="moto-status"><span className={disassembled ? 'dot hot' : 'dot'} />{disassembled ? 'VISTA EXPLOTADA' : 'MÁQUINA LISTA'}</div>
              <div className="moto-badge">HONDA STEED · GILLETTE SUBI <b>01</b></div>
            </div>
          </div>
        </section>

        <section className="quote">
          <div className="quote-bg" style={{ backgroundImage: `url(${road})` }} />
          <div className="quote-overlay" />
          <div className="quote-content reveal-up"><span>“</span><h2>NO SE TRATA<br />DEL DESTINO.<br /><em>SE TRATA DEL CAMINO.</em></h2><small>— STREET FAMILY</small></div>
        </section>

        <section id="galeria" className="gallery section-pad">
          <div className="section-label reveal-up">03 / GALERÍA</div>
          <div className="gallery-head reveal-up">
            <div>
              <p className="eyebrow">MEMORIAS DE LA RUTA</p>
              <h2>EN LA <em>CALLE</em></h2>
            </div>
            <div className="gallery-controls">
              <button onClick={() => scrollGallery(-1)}>←</button>
              <button onClick={() => scrollGallery(1)}>→</button>
            </div>
          </div>
          <div className="gallery-carousel reveal-up" ref={galleryRef}>
            {gallery.map((item, idx) => (
              <div key={idx} className="gallery-slide">
                <img src={item.src} alt={item.title} style={item.style || {}} />
                <div className="slide-caption">
                  <span>STREET FAMILY / {String(idx + 1).padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contacto" className="contact section-pad">
          <div className="contact-inner reveal-up" style={{position: 'relative', zIndex: 1}}>
            <img src={skull2} style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'clamp(400px, 60vw, 800px)', opacity: 0.7, zIndex: -1, pointerEvents: 'none', mixBlendMode: 'screen', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)', maskImage: 'radial-gradient(circle, black 40%, transparent 70%)'}} alt="" />
            <p className="eyebrow">¿NOS VEMOS EN LA RUTA?</p>
            <h2>STREET<br /><em>FAMILY.</em></h2>
            <p>La carretera es más grande cuando se comparte.</p>
            <div className="contact-actions">
              <a href="https://www.facebook.com/share/1FHT1XmUjg/" target="_blank" rel="noopener noreferrer" className="btn facebook-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{marginRight: '10px', marginTop: '-2px'}}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>FACEBOOK</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer><span>© {new Date().getFullYear()} STREET FAMILY MOTO GROUP</span><span>CUSTOM · ROAD · BROTHERHOOD</span></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
