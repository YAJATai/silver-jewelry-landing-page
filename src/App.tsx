import { useState, useRef, useEffect, CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";

// For suppressing Framer Motion dev warnings about list keys
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === "string" && args[0].includes("Framer Motion")) {
      return;
    }
    originalError(...args);
  };
}

// Inline SVGs / Custom Components
export function ArrowUpRight({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export function PlayIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <polygon points="6,4 20,12 6,20" />
    </svg>
  );
}

export function ClockOutlineIcon({ className = "h-7 w-7 text-white" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function GlobeOutlineIcon({ className = "h-7 w-7 text-white" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

interface IconProps {
  className?: string;
}

export function HammerIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6l-3 3-4.3-4.3C.6 7.1 1 10.1 3 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.4-.4.4-1 0-1.4z" />
    </svg>
  );
}

export function ShieldBadgeIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  );
}

export function DiamondIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3H5L2 9l10 12L22 9l-3-6zM9.62 8L8 5h8l-1.62 3H9.62zm-1.06 1L12 18.5 7.44 9h1.12zM18.62 8h-1.06l1.62-3 1.06 2.04L18.62 8z" />
    </svg>
  );
}

// FadingVideo component (custom JS crossfade, no CSS transitions)
interface FadingVideoProps {
  src: string;
  className?: string;
  style?: CSSProperties;
}

export function FadingVideo({ src, className, style }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset video state
    video.style.opacity = "0";
    video.loop = false;
    fadingOutRef.current = false;

    const FADE_MS = 500;
    const FADE_OUT_LEAD = 0.55;

    const fadeTo = (targetOpacity: number, duration: number = FADE_MS) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      const startOpacity = parseFloat(video.style.opacity) || 0;
      const opacityDiff = targetOpacity - startOpacity;
      if (opacityDiff === 0) return;

      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentOpacity = startOpacity + opacityDiff * progress;
        video.style.opacity = currentOpacity.toFixed(3);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          video.style.opacity = targetOpacity.toString();
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    const handleLoadedData = () => {
      video.style.opacity = "0";
      fadingOutRef.current = false;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => console.log("Video play interrupted:", err));
      }
      fadeTo(1);
    };

    const handleTimeUpdate = () => {
      const duration = video.duration;
      const currentTime = video.currentTime;
      if (!isNaN(duration) && duration > 0) {
        if (!fadingOutRef.current && (duration - currentTime) <= FADE_OUT_LEAD && (duration - currentTime) > 0) {
          fadingOutRef.current = true;
          fadeTo(0);
        }
      }
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        if (!video) return;
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => console.log("Video restart interrupted:", err));
        }
        fadingOutRef.current = false;
        fadeTo(1);
      }, 100);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // Initial check if video is already loaded
    if (video.readyState >= 2) {
      handleLoadedData();
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      style={{ ...style, opacity: 0 }}
      muted
      playsInline
      preload="auto"
    />
  );
}

// BlurText component (word-by-word blur-in based on 10% IntersectionObserver)
interface BlurTextProps {
  text: string;
  className?: string;
}

export function BlurText({ text, className }: BlurTextProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const words = text.split(" ");

  return (
    <p
      ref={containerRef}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        rowGap: "0.1em",
      }}
    >
      {words.map((word, i) => {
        const delay = (i * 100) / 1000; // seconds

        return (
          <motion.span
            key={i}
            id={`blur-text-word-${i}`}
            style={{
              display: "inline-block",
              marginRight: "0.28rem",
            }}
            initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
            animate={
              isInView
                ? {
                    filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                    opacity: [0, 0.5, 1],
                    y: [50, -5, 0],
                  }
                : { filter: "blur(10px)", opacity: 0, y: 50 }
            }
            transition={{
              duration: 0.7,
              times: [0, 0.5, 1],
              ease: "easeOut",
              delay: delay,
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </p>
  );
}

// Mock Collection masterpieces for beautiful interactives
const COLLECTION_ICONS = [HammerIcon, DiamondIcon, ShieldBadgeIcon];

const SELECTED_COLLECTIONS = [
  {
    name: "The Hammered Torque",
    price: "$1,850",
    description: "Solid 925 sterling collar featuring variable weight transitions and deep chiseled facets.",
    specs: "Hand-cast · 82g sterling · Certified hallmark",
  },
  {
    name: "Argent Choker",
    price: "$2,400",
    description: "Flowing organic line designed to rest effortlessly on the collarbone, mirror-polished.",
    specs: "Anticlastic forming · 110g sterling · Signed piece",
  },
  {
    name: "Cascade Ridge Band",
    price: "$480",
    description: "Heavy multi-tiered wedding band reflecting direct raw hammer striations.",
    specs: "Oxidized recess · Hand-cast · Lifetime mark",
  },
];

const TESTIMONIALS = [
  {
    quote: "The weight of the silver, the precision of the facets — it feels less like jewelry and more like a continuation of the hand that made it. I have not taken my band off since the fitting.",
    name: "Camille Duras",
    title: "Curator, Musée des Arts Décoratifs",
    initials: "CD",
  },
  {
    quote: "I commissioned a bespoke torque for my husband's fortieth. The atelier invited us into the process — sketches, wax carvings, even the choice of hammer texture. It is now the most cherished object in his collection.",
    name: "James Whitfield-Stahl",
    title: "Private Collector, London",
    initials: "JW",
  },
  {
    quote: "What drew me to Atelier of Silver was the philosophy: every mark of the hammer is preserved. This is not mass production. It is sculpture you can wear.",
    name: "Inés Mendoza",
    title: "Fashion Editor, Vogue España",
    initials: "IM",
  },
  {
    quote: "The Cascade Ridge Band arrived in a simple linen pouch, with a handwritten note from the silversmith. That human touch is worth more than any velvet box.",
    name: "Ryo Tanaka",
    title: "Architect & Design Patron",
    initials: "RT",
  },
];

export default function App() {
  // Navigation states and modals
  const [activeModal, setActiveModal] = useState<"booking" | "bespoke" | "collections" | "craft-watch" | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Scrolled check for minimal nav styling
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Form submit handles
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bespokeSubmitted, setBespokeSubmitted] = useState(false);

  // Smooth scroll method
  const scrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const [email, setEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-white/20">
      
      {/* Navbar (fixed top-4, px-8 / lg:px-16, z-50) */}
      <nav 
        id="main-nav"
        className={`fixed top-4 left-0 w-full px-4 md:px-8 lg:px-16 z-50 transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: 48x48 liquid-glass circle with italic serif lowercase "s" */}
          <button
            id="nav-logo"
            onClick={scrollToHero}
            className="w-12 h-12 rounded-full flex items-center justify-center liquid-glass font-heading italic text-3xl font-medium text-white transition-all hover:scale-105 active:scale-95 cursor-pointer select-none"
          >
            s
          </button>

          {/* Center (desktop only): liquid-glass pill, px-1.5 py-1.5, holding 5 links + button */}
          <div 
            id="nav-center-pill"
            className="hidden md:flex items-center gap-1.5 liquid-glass rounded-full px-1.5 py-1.5"
          >
            <button 
              onClick={scrollToHero} 
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => setActiveModal("collections")} 
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors cursor-pointer"
            >
              Collections
            </button>
            <button 
              onClick={() => scrollTo("craftsmanship-section")} 
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors cursor-pointer"
            >
              Craftsmanship
            </button>
            <button 
              onClick={() => setActiveModal("bespoke")} 
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors cursor-pointer"
            >
              Bespoke
            </button>
            <button 
              onClick={() => setActiveModal("booking")} 
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors pr-4 border-r border-white/10 cursor-pointer"
            >
              Visit Atelier
            </button>
            
            {/* White pill button Book a Viewing + ArrowUpRight */}
            <button
              id="btn-book-nav"
              onClick={() => setActiveModal("booking")}
              className="bg-white text-black font-body rounded-full px-5 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap transition-transform duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer ml-1"
            >
              Book a Viewing
              <ArrowUpRight className="h-4 w-4 stroke-neutral-900" />
            </button>
          </div>

          {/* Mobile: hamburger + book */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setActiveModal("booking")}
              className="liquid-glass rounded-full px-4 py-2 text-xs font-semibold text-white/95"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-12 h-12 flex items-center justify-center liquid-glass rounded-full text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>

          {/* Right: 48x48 invisible spacer to balance logo */}
          <div className="w-12 h-12 invisible hidden md:block"></div>
        </div>
      </nav>


      {/* Section 1 — Hero (full viewport, black bg) */}
      <section 
        id="hero-section"
        className="relative h-screen w-full bg-black overflow-hidden flex flex-col justify-between z-10"
      >
        {/* Background video (120% width/height, top-aligned, centered horizontally) */}
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
          className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
          style={{ width: "120%", height: "120%" }}
        />

        {/* Hero content (centered, pt-32 px-4) */}
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center pt-32 px-4 max-w-4xl mx-auto w-full">
          
          {/* Badge (delay 0.4s) */}
          <motion.div
            id="hero-badge"
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="flex items-center gap-2.5 p-1 pr-3.5 rounded-full liquid-glass mb-6 w-fit"
          >
            <span className="bg-white text-black px-3 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider">
              New
            </span>
            <span className="text-xs md:text-sm text-white/90 font-body font-normal">
              Spring Heritage Collection Now in Atelier
            </span>
          </motion.div>

          {/* Headline (BlurText component, word-by-word animation) */}
          <div className="mb-4">
            <BlurText 
              text="Silver Shaped By Hand, Worn For A Lifetime"
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-3xl justify-center tracking-[-4px]"
            />
          </div>

          {/* Subheading (delay 0.8s, mt-4) */}
          <motion.p
            id="hero-subheading"
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
            className="mt-6 text-sm md:text-base text-white/80 max-w-2xl font-body font-light leading-relaxed"
          >
            Each piece begins as raw sterling and ends as heirloom. Our artisans cast, hammer, and polish every form by hand — precision without losing the mark of the maker.
          </motion.p>

          {/* CTAs (delay 1.1s, flex items-center gap-6 mt-6) */}
          <motion.div
            id="hero-ctas"
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1.1 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-8"
          >
            {/* Primary */}
            <button
              onClick={() => setActiveModal("collections")}
              className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-semibold text-white flex items-center gap-2 hover:scale-[1.03] active:scale-95 transition-transform duration-200 cursor-pointer"
            >
              Explore the Collection
              <ArrowUpRight className="h-5 w-5 text-white" />
            </button>

            {/* Secondary */}
            <button
              onClick={() => setActiveModal("craft-watch")}
              className="text-white/90 text-sm font-semibold flex items-center gap-2.5 group hover:text-white transition-colors cursor-pointer py-2 px-1"
            >
              <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 transition-transform duration-300 group-hover:scale-110">
                <PlayIcon className="h-3.5 w-3.5 text-white fill-white ml-0.5" />
              </span>
              Watch Our Craft
            </button>
          </motion.div>

          {/* Stats row (delay 1.3s, flex items-stretch gap-4 mt-8) */}
          <motion.div
            id="hero-stats"
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1.3 }}
            className="flex flex-col sm:flex-row items-stretch justify-center gap-4 mt-12 w-full max-w-lg"
          >
            {/* Card 1 */}
            <div className="liquid-glass p-5 flex-1 min-w-[200px] rounded-[1.25rem] text-left flex flex-col justify-between hover:bg-white/[0.03] transition-colors group">
              <div className="mb-6 bg-white/5 p-2 rounded-xl w-fit group-hover:bg-white/10 transition-colors">
                <ClockOutlineIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="font-heading italic text-white text-4xl tracking-[-1px] leading-none block">
                  40+ Hrs
                </span>
                <span className="text-xs text-white/70 font-body font-light mt-1 block uppercase tracking-wider">
                  Average Hours Per Piece
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="liquid-glass p-5 flex-1 min-w-[200px] rounded-[1.25rem] text-left flex flex-col justify-between hover:bg-white/[0.03] transition-colors group">
              <div className="mb-6 bg-white/5 p-2 rounded-xl w-fit group-hover:bg-white/10 transition-colors">
                <GlobeOutlineIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="font-heading italic text-white text-4xl tracking-[-1px] leading-none block">
                  60K+
                </span>
                <span className="text-xs text-white/70 font-body font-light mt-1 block uppercase tracking-wider">
                  Pieces Worn Worldwide
                </span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Partners (bottom of hero, delay 1.4s) */}
        <motion.div
          id="hero-partners"
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.4 }}
          className="relative z-10 flex flex-col items-center gap-6 pb-12 w-full px-4"
        >
          <div className="liquid-glass rounded-full px-4 py-1.5 text-[11px] uppercase tracking-widest font-semibold text-white/80">
            Sourced from certified ethical silver mines
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3 font-heading italic text-2xl md:text-3xl tracking-tight text-white/90">
            <span className="hover:text-white cursor-default transition-colors">Argent</span>
            <span className="text-white/20 select-none">•</span>
            <span className="hover:text-white cursor-default transition-colors">Lumen</span>
            <span className="text-white/20 select-none">•</span>
            <span className="hover:text-white cursor-default transition-colors">Forme</span>
            <span className="text-white/20 select-none">•</span>
            <span className="hover:text-white cursor-default transition-colors">Marin</span>
            <span className="text-white/20 select-none">•</span>
            <span className="hover:text-white cursor-default transition-colors">Reine</span>
          </div>
        </motion.div>
      </section>


      {/* Section 2 — Craftsmanship (min-h-screen, black bg) */}
      <section 
        id="craftsmanship-section"
        className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col z-10"
      >
        {/* Background video (full-bleed, no 120% scale) */}
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Content */}
        <div className="relative z-10 px-6 md:px-16 lg:px-20 pt-28 pb-16 flex flex-col min-h-screen max-w-7xl mx-auto w-full">
          
          {/* Header (mb-auto) */}
          <motion.div 
            id="craftsmanship-header"
            initial={{ filter: "blur(10px)", opacity: 0, y: 30 }}
            whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="mb-auto max-w-2xl"
          >
            <div className="text-xs md:text-sm font-semibold tracking-widest font-body text-white/70 mb-4 uppercase">
              // Craftsmanship
            </div>
            <h2 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.85] tracking-[-3px]">
              Silver<br />perfected
            </h2>
          </motion.div>

          {/* Three cards (grid grid-cols-1 md:grid-cols-3 gap-6 mt-16) */}
          <div 
            id="craftsmanship-cards-grid"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full"
          >
            
            {/* Card 1 - Hand Casting */}
            <motion.div
              id="craft-card-1"
              initial={{ filter: "blur(10px)", opacity: 0, y: 40 }}
              whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-[0.75rem] flex items-center justify-center bg-white/5 border border-white/10 text-white shadow-sm">
                  <HammerIcon className="h-5 w-5" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {["Hand Cast", "925 Sterling", "One of a Kind", "No Two Alike"].map((tag, idx) => (
                    <span 
                      key={idx}
                      className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] font-body text-white/80 tracking-wide font-medium whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Bottom */}
              <div className="mt-8">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
                  Hand Casting
                </h3>
                <p className="mt-3.5 text-sm md:text-base text-white/80 font-body font-light leading-relaxed max-w-[32ch]">
                  Every form begins in raw sterling, cast and shaped by hand in our atelier — no two pieces ever fully alike.
                </p>
              </div>
            </motion.div>

            {/* Card 2 - Hallmark Quality */}
            <motion.div
              id="craft-card-2"
              initial={{ filter: "blur(10px)", opacity: 0, y: 40 }}
              whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
              className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-[0.75rem] flex items-center justify-center bg-white/5 border border-white/10 text-white shadow-sm">
                  <ShieldBadgeIcon className="h-5 w-5" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {["Hallmarked", "Lab Certified", "Lifetime Mark", "Verified Purity"].map((tag, idx) => (
                    <span 
                      key={idx}
                      className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] font-body text-white/80 tracking-wide font-medium whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Bottom */}
              <div className="mt-8">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
                  Hallmark Quality
                </h3>
                <p className="mt-3.5 text-sm md:text-base text-white/80 font-body font-light leading-relaxed max-w-[32ch]">
                  Each piece is hallmarked and certified for 925 purity, carrying a mark that traces back to the maker's bench.
                </p>
              </div>
            </motion.div>

            {/* Card 3 - Finishing Touch */}
            <motion.div
              id="craft-card-3"
              initial={{ filter: "blur(10px)", opacity: 0, y: 40 }}
              whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-[0.75rem] flex items-center justify-center bg-white/5 border border-white/10 text-white shadow-sm">
                  <DiamondIcon className="h-5 w-5" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {["Mirror Polish", "Oxidized Detail", "Tarnish Resistant", "Hand Finished"].map((tag, idx) => (
                    <span 
                      key={idx}
                      className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] font-body text-white/80 tracking-wide font-medium whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Bottom */}
              <div className="mt-8">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
                  Finishing Touch
                </h3>
                <p className="mt-3.5 text-sm md:text-base text-white/80 font-body font-light leading-relaxed max-w-[32ch]">
                  Hand-polished to a mirror finish, with oxidized detailing that deepens with time and wear.
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* Section 3 — Featured Collections (icon-based glass cards, no photos) */}
      <section id="collections-section" className="relative w-full bg-black overflow-hidden z-10 py-28 px-6 md:px-16 lg:px-20">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 30 }}
            whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="mb-4"
          >
            <div className="text-xs md:text-sm font-semibold tracking-widest font-body text-white/70 mb-4 uppercase">
              // Featured Works
            </div>
            <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-[5rem] leading-[0.85] tracking-[-3px] mb-4">
              Selected<br />collections
            </h2>
            <p className="text-sm md:text-base text-white/60 font-body font-light max-w-xl leading-relaxed">
              Each piece in our current rotation represents a distinct conversation between the maker's hand and the metal's memory.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {SELECTED_COLLECTIONS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ filter: "blur(10px)", opacity: 0, y: 40 }}
                whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.15 }}
                onClick={() => setActiveModal("collections")}
                className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between cursor-pointer hover:scale-[1.01] transition-transform duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-11 h-11 rounded-[0.75rem] flex items-center justify-center bg-white/5 border border-white/10 text-white shadow-sm">
                    {idx === 0 ? <HammerIcon className="h-5 w-5" /> : idx === 1 ? <DiamondIcon className="h-5 w-5" /> : <ShieldBadgeIcon className="h-5 w-5" />}
                  </div>
                  <span className="font-body font-semibold text-sm text-white/90">{item.price}</span>
                </div>
                <div className="flex-1" />
                <div className="mt-8">
                  <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none mb-2">{item.name}</h3>
                  <p className="text-sm text-white/70 font-body font-light leading-relaxed max-w-[32ch]">{item.description}</p>
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-body font-medium mt-3 block">{item.specs}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <button
              onClick={() => setActiveModal("collections")}
              className="liquid-glass-strong rounded-full px-8 py-3.5 text-sm font-semibold text-white flex items-center gap-2 hover:scale-[1.03] active:scale-95 transition-transform duration-200"
            >
              View Full Collection
              <ArrowUpRight className="h-5 w-5 text-white" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Section 4 — Testimonials */}
      <section id="testimonials-section" className="relative w-full bg-black overflow-hidden z-10 py-28 px-6 md:px-16 lg:px-20">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 30 }}
            whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="mb-4 text-center"
          >
            <div className="text-xs md:text-sm font-semibold tracking-widest font-body text-white/70 mb-4 uppercase">
              // The Atelier Chronicle
            </div>
            <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-[5rem] leading-[0.85] tracking-[-3px] mb-4">
              Voices of<br />our patrons
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto mt-12">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="liquid-glass rounded-[1.25rem] p-8 md:p-12 text-center"
            >
              <svg className="w-10 h-10 text-white/20 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="font-heading italic text-xl md:text-2xl text-white/90 leading-relaxed mb-8">
                &ldquo;{TESTIMONIALS[activeTestimonial].quote}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-heading italic text-white">
                  {TESTIMONIALS[activeTestimonial].initials}
                </div>
                <div className="text-left">
                  <div className="font-heading italic text-white text-lg">{TESTIMONIALS[activeTestimonial].name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-body font-medium">{TESTIMONIALS[activeTestimonial].title}</div>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-3 mt-8">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === activeTestimonial ? "bg-white w-6" : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Newsletter */}
      <section id="newsletter-section" className="relative w-full bg-black overflow-hidden z-10 py-28 px-6 md:px-16 lg:px-20">
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
        />
        <div className="relative z-10 max-w-3xl mx-auto w-full text-center">
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 30 }}
            whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="text-xs md:text-sm font-semibold tracking-widest font-body text-white/70 mb-4 uppercase">
              // Stay Connected
            </div>
            <h2 className="font-heading italic text-white text-5xl md:text-6xl leading-[0.85] tracking-[-3px] mb-4">
              The Atelier<br />Dispatch
            </h2>
            <p className="text-sm md:text-base text-white/60 font-body font-light max-w-lg mx-auto leading-relaxed mb-10">
              Receive invitations to private viewings, early access to new collections, and dispatches from the workbench.
            </p>

            {newsletterSubmitted ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="liquid-glass rounded-[1.25rem] p-8 max-w-md mx-auto"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-heading italic text-2xl text-white">You&rsquo;re on the list</p>
                <p className="text-xs text-white/60 mt-2 font-body font-light">Welcome to the Atelier.</p>
              </motion.div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email) setNewsletterSubmitted(true);
                }}
                className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 w-full bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:border-white/40 text-white font-body placeholder:text-white/30"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-white text-black rounded-full px-6 py-3.5 text-sm font-semibold transition hover:scale-[1.03] active:scale-95 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-20 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <button onClick={scrollToHero} className="w-12 h-12 rounded-full flex items-center justify-center liquid-glass font-heading italic text-3xl font-medium text-white mb-4 cursor-pointer">
                s
              </button>
              <p className="text-xs text-white/40 font-body font-light leading-relaxed max-w-[20ch]">
                Hand-cast sterling silver, forged in the atelier. Each piece hallmarked and certified.
              </p>
            </div>
            <div>
              <h4 className="font-heading italic text-white text-lg mb-4">Navigate</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Collections", action: () => setActiveModal("collections") },
                  { label: "Craftsmanship", action: () => scrollTo("craftsmanship-section") },
                  { label: "Bespoke", action: () => setActiveModal("bespoke") },
                  { label: "Atelier Visit", action: () => setActiveModal("booking") },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="text-xs text-white/50 hover:text-white transition-colors font-body font-medium cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading italic text-white text-lg mb-4">Support</h4>
              <ul className="space-y-2.5">
                {["Shipping & Returns", "Care Guide", "Certificate of Authenticity", "FAQ"].map((item) => (
                  <li key={item}>
                    <span className="text-xs text-white/50 hover:text-white transition-colors font-body font-medium cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading italic text-white text-lg mb-4">Connect</h4>
              <ul className="space-y-2.5">
                {["Instagram", "Pinterest", "Vimeo", "The Journal"].map((item) => (
                  <li key={item}>
                    <span className="text-xs text-white/50 hover:text-white transition-colors font-body font-medium cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
            <p className="text-[10px] text-white/30 tracking-wider uppercase font-body">
              © 2026 Atelier of Silver. All Rights Reserved.
            </p>
            <p className="text-[10px] text-white/20 tracking-wider font-body">
              Ethics & Sustainability · Privacy · Terms
            </p>
          </div>
        </div>
      </footer>

      {/* Interactive Modal Manager */}
      <AnimatePresence>
        
        {/* Collections side drawer / overlay */}
        {activeModal === "collections" && (
          <motion.div 
            id="collections-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex justify-end"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              id="collections-modal-content"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-xl bg-neutral-950 border-l border-white/10 h-full p-8 overflow-y-auto flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                  <div className="font-heading italic text-3xl text-white">Masterpieces</div>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/5 select-none transition-colors text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {SELECTED_COLLECTIONS.map((item, idx) => {
                    const Icon = COLLECTION_ICONS[idx];
                    return (
                      <div key={idx} className="flex gap-4 items-start group liquid-glass rounded-[1.25rem] p-5">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1 gap-2">
                            <h4 className="font-heading italic text-xl text-white truncate">{item.name}</h4>
                            <span className="font-body font-semibold text-white/90 text-sm shrink-0">{item.price}</span>
                          </div>
                          <p className="text-xs text-white/70 font-body font-light leading-relaxed mb-1.5">
                            {item.description}
                          </p>
                          <span className="text-[10px] uppercase tracking-wider text-white/40 block font-body font-medium">
                            {item.specs}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-white/5 flex flex-col gap-4">
                <button
                  onClick={() => {
                    setActiveModal("booking");
                  }}
                  className="w-full text-center bg-white text-black py-4.5 rounded-full font-semibold transition-transform hover:scale-[1.02] active:scale-95"
                >
                  Book Private Atelier Session
                </button>
                <p className="text-[10px] text-white/40 text-center uppercase tracking-widest leading-loose">
                  Viewing invitations require 24h confirmation.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Private Booking Modal */}
        {activeModal === "booking" && (
          <motion.div
            id="booking-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => {
              setActiveModal(null);
              setBookingSubmitted(false);
            }}
          >
            <motion.div
              id="booking-modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg liquid-glass-strong rounded-3xl p-8 border border-white/15"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <h3 className="font-heading italic text-3xl text-white">Atelier Booking</h3>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setBookingSubmitted(false);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/5 text-white/80"
                >
                  ✕
                </button>
              </div>

              {bookingSubmitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-heading italic text-3xl text-white mb-2">Invitation Requested</h4>
                  <p className="text-sm font-body font-light text-white/80 leading-relaxed max-w-sm mx-auto">
                    We have received your private viewing request. Our liaison will contact you within 24 hours to secure your appointment.
                  </p>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setBookingSubmitted(false);
                    }}
                    className="mt-8 px-6 py-2.5 bg-white text-black rounded-full font-semibold transition hover:scale-105"
                  >
                    Return to Atelier
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setBookingSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-semibold">Your Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white font-body"
                      placeholder="Evelyn Vane"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-semibold">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white font-body"
                      placeholder="evelyn@houseofvane.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-semibold">Preferred Location</label>
                      <select className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white font-body">
                        <option>Place Vendôme, Paris</option>
                        <option>SoHo, New York</option>
                        <option>Via Montenapoleone, Milan</option>
                        <option>Mayfair, London</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-semibold">Preferred Date</label>
                      <input
                        required
                        type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white font-body"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white text-black py-4 rounded-full font-bold transition hover:scale-[1.02] active:scale-95 mt-4"
                  >
                    Request Viewing Invitation
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Bespoke Request Modal */}
        {activeModal === "bespoke" && (
          <motion.div
            id="bespoke-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => {
              setActiveModal(null);
              setBespokeSubmitted(false);
            }}
          >
            <motion.div
              id="bespoke-modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg liquid-glass-strong rounded-3xl p-8 border border-white/15"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <h3 className="font-heading italic text-3xl text-white">Bespoke Commission</h3>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setBespokeSubmitted(false);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/5 text-white/80"
                >
                  ✕
                </button>
              </div>

              {bespokeSubmitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-heading italic text-3xl text-white mb-2">Commission Registered</h4>
                  <p className="text-sm font-body font-light text-white/80 leading-relaxed max-w-sm mx-auto">
                    A dedicated master jeweler will review your vision. Expect an invitation for a design workshop within 48 hours.
                  </p>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setBespokeSubmitted(false);
                    }}
                    className="mt-8 px-6 py-2.5 bg-white text-black rounded-full font-semibold transition hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setBespokeSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-semibold">Your Name / Agent</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white font-body"
                      placeholder="Alessandro Rossellini"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-semibold">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white font-body"
                      placeholder="rossellini@atelier.it"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-semibold">Commission Concept</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white font-body resize-none"
                      placeholder="Specify size, styling (cast/hammered/etched), and custom engravings or precious inclusions..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white text-black py-4 rounded-full font-bold transition hover:scale-[1.02] active:scale-95 mt-4"
                  >
                    Initiate Bespoke Request
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Cinematic Craft Video Lightbox */}
        {activeModal === "craft-watch" && (
          <motion.div
            id="craft-watch-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4 md:p-8"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              id="craft-watch-modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl relative overflow-hidden rounded-3xl bg-black border border-white/15"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center border border-white/10 text-white transition-colors"
              >
                ✕
              </button>

              {/* Cinematic Preview Player */}
              <video 
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
                className="w-full aspect-video object-cover"
                autoPlay
                controls
                playsInline
              />

              <div className="p-6 bg-neutral-950 border-t border-white/5">
                <h4 className="font-heading italic text-2xl text-white mb-2">The Fire & The Hammer</h4>
                <p className="text-xs md:text-sm text-white/70 font-body font-light leading-relaxed">
                  A visual documentation of our hand-carving and casting workflow. From initial graphite sketch to smelting pure silver grains, followed by three levels of polishing with premium abrasive creams and micro-fiber chamois.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-72 bg-neutral-950 border-l border-white/10 p-8 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/5">
                <span className="font-heading italic text-2xl text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/5 text-white/80"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-1">
                {[
                  { label: "Home", action: scrollToHero },
                  { label: "Collections", action: () => { setMobileMenuOpen(false); setActiveModal("collections"); } },
                  { label: "Craftsmanship", action: () => scrollTo("craftsmanship-section") },
                  { label: "Featured Works", action: () => scrollTo("collections-section") },
                  { label: "Testimonials", action: () => scrollTo("testimonials-section") },
                  { label: "Bespoke", action: () => { setMobileMenuOpen(false); setActiveModal("bespoke"); } },
                  { label: "Visit Atelier", action: () => { setMobileMenuOpen(false); setActiveModal("booking"); } },
                ].map((link) => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className="text-left px-4 py-3.5 rounded-xl text-sm font-body font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              <button
                onClick={() => { setMobileMenuOpen(false); setActiveModal("booking"); }}
                className="w-full text-center bg-white text-black py-4 rounded-full font-semibold transition hover:scale-[1.02] active:scale-95 mt-auto"
              >
                Book a Viewing
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

    </main>
  );
}
