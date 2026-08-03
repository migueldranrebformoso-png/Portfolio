import { useEffect, useRef, useState, useCallback } from "react";
import {
  IconArrowUpRight,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandReact,
  IconBrain,
  IconCode,
  IconCube3dSphere,
  IconDownload,
  IconMail,
  IconMoon,
  IconPalette,
  IconSparkles,
  IconSun,
  IconCertificate,
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

// ── Loading Screen — eat(); sleep(); code(); repeat(); ───────────────────────
function LoadingScreen({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onDone, reduced ? 400 : 2800);
    return () => clearTimeout(timer);
  }, [onDone, reduced]);

  const items = [
    {
      label: "eat",
      icon: (
        <motion.div
          animate={reduced ? {} : { rotate: [0, -15, 15, -10, 0] }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeInOut" }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 0 0-5 5v6h3.5c.8 0 1.5.7 1.5 1.5v.5" />
            <path d="M18 21v-3" />
          </svg>
        </motion.div>
      ),
    },
    {
      label: "sleep",
      icon: (
        <motion.div
          animate={reduced ? {} : { y: [0, -6, 0, -4, 0] }}
          transition={{ delay: 0.5, duration: 1.2, ease: "easeInOut" }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </motion.div>
      ),
    },
    {
      label: "code",
      icon: (
        <motion.div
          animate={reduced ? {} : { scaleX: [1, 1.18, 0.88, 1.08, 1] }}
          transition={{ delay: 0.7, duration: 0.7, ease: "easeInOut" }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </motion.div>
      ),
    },
    {
      label: "repeat",
      icon: (
        <motion.div
          animate={reduced ? {} : { rotate: [0, 360] }}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.23, 1, 0.32, 1] as [number,number,number,number] }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 2l4 4-4 4" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 22l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </motion.div>
      ),
    },
  ];

  return (
    <motion.div
      className="loader"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number,number,number,number] },
      }}
    >
      <div className="loader-items">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            className="loader-item"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reduced ? 0 : i * 0.18,
              duration: 0.5,
              ease: [0.23, 1, 0.32, 1] as [number,number,number,number],
            }}
          >
            <span className="loader-item-icon">{item.icon}</span>
            <span className="loader-item-fn">
              <span className="loader-fn-name">{item.label}</span>
              <span className="loader-fn-open">(</span>
              <span className="loader-fn-close">)</span>
              <span className="loader-fn-semi">;</span>
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Reveal wrapper: opacity+y, once, stagger via delay prop ──────────────────
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.65,
        delay: reduced ? 0 : delay,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
// ── TiltCard: 3D mouse-tracking tilt + inner zoom on hover ───────────────────
function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 22 });
  const scale = useMotionValue(1);
  const springScale = useSpring(scale, { stiffness: 200, damping: 24 });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateY.set(dx * 10);
    rotateX.set(-dy * 8);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  const handleEnter = () => scale.set(1.02);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX: springX,
        rotateY: springY,
        scale: springScale,
        transformStyle: "preserve-3d",
        transformPerspective: 900,
      }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerEnter={handleEnter}
    >
      {children}
    </motion.div>
  );
}

const stats = [
  ["3+", "Years Learning Design"],
  ["2", "Projects"],
  ["AI", "Focused"],
  ["QCU", "3rd Year IT"],
];

const skills = [
  {
    title: "UI/UX",
    icon: IconPalette,
    items: ["Figma", "Wireframing", "Prototyping", "User Research"],
  },
  {
    title: "Frontend",
    icon: IconBrandReact,
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML", "CSS", "JavaScript" ],
  },
  {
    title: "AI",
    icon: IconBrain,
    items: ["OpenAI APIs", "Prompt Engineering", "Kiro", "Codex"],
  },
  {
    title: "Development",
    icon: IconCode,
    items: ["JavaScript", "Git", "Firebase", "Node.js"],
  },
];

const projects = [
  {
    title: "QuizzyBee",
    desc: "A child-friendly quiz system built for kids 5 years old and below. Designed with playful visuals and simple interactions to make early learning fun and accessible.",
    tags: ["PHP", "CSS", "JavaScript", "HTML"],
    gradient: "project-a",
    year: "2025",
    liveUrl: null,
    githubUrl: "https://github.com/migueldranrebformoso-png/QuizzyBee",
    image: "/projects/quizzybee.png",
  },
  {
    title: "Product Design System",
    desc: "A polished component language for fast prototyping, built around reusable patterns, motion, and accessibility.",
    tags: ["Figma", "Design System", "Prototype"],
    gradient: "project-b",
    year: "2024",
    liveUrl: null,
    githubUrl: null,
    image: null,
  },
  {
    title: "Smart Portfolio Lab",
    desc: "An experimental interface using scroll animation, layered depth, and cinematic transitions to present work.",
    tags: ["Three.js", "GSAP", "Motion"],
    gradient: "project-c",
    year: "2026",
    liveUrl: "https://www.dreb.me",
    githubUrl: null,
    image: null,
  },
];

const timeline = [
  ["Education", "3rd-year Information Technology student at Quezon City University."],
  ["Hackathons", "Exploring rapid product thinking, prototypes, and creative technical problem solving."],
  ["Freelance", "Designing clean interfaces and practical web experiences for real-world needs."],
  ["Personal Projects", "Building frontend experiments, AI workflows, and portfolio-grade product concepts."],
  ["AI Experiments", "Testing prompt systems, automation patterns, and human-centered AI tools."],
];

// ── Add your certificates here ─────────────────────────────────────────────
const certificates = [
  {
    title: "Commit to the Cloud:A Hands-on Introduction to GIT, GitHub & Cloud Deployment with AWS  ",
    issuer: "Amazon Web Services / QCU",
    date: "2026",
    image: "/certs/aws-qcu.jpg",
  },
  // copy the block above to add more
];

// ── Add your activities here ───────────────────────────────────────────────
const activities = [
  {
    title: "AWS Summit",
    role: "Attendee",
    date: "2026",
    desc: "Attended the AWS Summit, exploring cloud services, AI tools, and developer sessions.",
    image: "/activities/awss.jpg",
  },
  {
    title: "Kiroverse",
    role: "Participant",
    date: "2026",
    desc: "Participated in Kiroverse, an event focused on AI-assisted development and modern tooling.",
    image: "/activities/kiroverse.jpg",
  },
  // copy the block above to add more
];

// ── Carousel ──────────────────────────────────────────────────────────────
function Carousel({
  children,
  label,
}: {
  children: React.ReactNode[];
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const reduced = useReducedMotion();

  // drag state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const updateButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    return () => el.removeEventListener("scroll", updateButtons);
  }, [updateButtons]);

  const scroll = (dir: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: reduced ? "instant" : "smooth" });
  };

  // pointer drag
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startScroll.current = trackRef.current?.scrollLeft ?? 0;
    trackRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    trackRef.current.scrollLeft = startScroll.current - (e.clientX - startX.current);
  };
  const onPointerUp = () => { isDragging.current = false; };

  return (
    <div className="carousel-wrap" aria-label={label}>
      <div
        className="carousel-track"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {children}
      </div>
      <div className="carousel-controls">
        <button
          className="carousel-btn"
          onClick={() => scroll("prev")}
          disabled={!canPrev}
          aria-label="Previous"
        >
          <IconChevronLeft size={20} />
        </button>
        <button
          className="carousel-btn"
          onClick={() => scroll("next")}
          disabled={!canNext}
          aria-label="Next"
        >
          <IconChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.15, 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.position.set(3.4, 0.05, 0);
    scene.add(group);

    const blueMaterial = new THREE.MeshPhysicalMaterial({
      color: "#3A0CA3",   /* Royal Iris */
      roughness: 0.22,
      metalness: 0.06,
      transmission: 0.38,
      thickness: 0.9,
      transparent: true,
      opacity: 0.74,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: "#FFF275",   /* Butter Yellow – warm tint */
      roughness: 0.06,
      metalness: 0,
      transmission: 0.72,
      thickness: 1.2,
      transparent: true,
      opacity: 0.52,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: "#3A0CA3",
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });

    const shapes: THREE.Object3D[] = [];
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.35, 48, 48), glassMaterial);
    sphere.position.set(1.8, 0.15, -0.6);
    group.add(sphere);
    shapes.push(sphere);

    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.76, 0.18, 160, 14), blueMaterial);
    knot.position.set(-1.7, -0.15, 0.2);
    group.add(knot);
    shapes.push(knot);

    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.65, 1), wireMaterial);
    wire.position.set(0.3, 0.8, -1.7);
    group.add(wire);
    shapes.push(wire);

    const ringMaterial = new THREE.MeshBasicMaterial({ color: "#FFF275", wireframe: true, transparent: true, opacity: 0.28 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.012, 12, 160), ringMaterial);
    ring.rotation.x = Math.PI / 2.6;
    group.add(ring);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 420;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: "#FFF275", size: 0.02, transparent: true, opacity: 0.65 }),
    );
    scene.add(particles);

    scene.add(new THREE.AmbientLight("#e8e0ff", 1.4));   /* Royal Iris ambient */
    const key = new THREE.PointLight("#FFF275", 14, 18); /* Butter Yellow rim light */
    key.position.set(-4, 4, 4);
    scene.add(key);
    const fill = new THREE.PointLight("#3A0CA3", 8, 14); /* Royal Iris fill */
    fill.position.set(4, -2, 2);
    scene.add(fill);

    const pointer = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.55;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.55;
    };
    window.addEventListener("pointermove", onPointerMove);

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.15,
      },
    });

    if (!reducedMotion) {
      timeline
        .to(camera.position, { z: 6.2, y: 0.65, ease: "none" }, 0)
        .to(group.rotation, { y: Math.PI * 1.4, x: -0.45, ease: "none" }, 0)
        .to(group.position, { y: -1.15, z: 0.8, ease: "none" }, 0)
        .to(particles.rotation, { y: Math.PI * 1.1, ease: "none" }, 0);
    }

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!reducedMotion) {
        group.rotation.y += 0.0025;
        group.rotation.x += (pointer.y - group.rotation.x) * 0.018;
        group.rotation.z += (pointer.x - group.rotation.z) * 0.018;
        shapes.forEach((shape, index) => {
          shape.rotation.x += 0.004 + index * 0.001;
          shape.rotation.y += 0.006 + index * 0.001;
        });
        ring.rotation.z += 0.003;
        particles.rotation.y += 0.0009;
      }
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      timeline.kill();
      renderer.dispose();
      particleGeometry.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return <div className="scene-canvas" ref={mountRef} aria-hidden="true" />;
}

function CursorFollower() {
  const reducedMotion = useReducedMotion();
  const mouseX = useMotionValue(-120);
  const mouseY = useMotionValue(-120);
  const springX = useSpring(mouseX, { stiffness: 260, damping: 32 });
  const springY = useSpring(mouseY, { stiffness: 260, damping: 32 });

  useEffect(() => {
    if (reducedMotion) return;
    const move = (event: PointerEvent) => {
      mouseX.set(event.clientX - 16);
      mouseY.set(event.clientY - 16);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [mouseX, mouseY, reducedMotion]);

  if (reducedMotion) return null;
  return <motion.div className="cursor-follower" style={{ x: springX, y: springY }} />;
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(() => {
    // respect system preference on first load
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 30);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`nav-shell ${scrolled ? "is-scrolled" : ""}`}>
      <a className="brand" href="#hero" aria-label="Go to top">
        <span>Dranreb Miguel</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
      <button
        className="theme-toggle"
        onClick={() => setDark(d => !d)}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <IconSun size={18} stroke={1.8} /> : <IconMoon size={18} stroke={1.8} />}
      </button>
    </header>
  );
}

function MagneticButton({
  href,
  children,
  variant = "primary",
  icon,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.22;
      gsap.to(el, { x, y, duration: 0.34, ease: "power3.out" });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.44, ease: "elastic.out(1, 0.45)" });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <a className={`magnetic-button ${variant}`} href={href} ref={ref}>
      <span>{children}</span>
      {icon}
    </a>
  );
}

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    const frame = requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);

    // Floating card parallax - valid scrub use
    gsap.to(".floating-card", {
      yPercent: -18,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {!loaded && <LoadingScreen key="loader" onDone={() => setLoaded(true)} />}
      </AnimatePresence>
      <CursorFollower />
      <ThreeScene />
      <Navigation />
      <main>
        {/* ── Hero ── */}
        <section className="hero section" id="hero">
          <div className="hero-content">
            <Reveal>
              <p className="hero-kicker">
                QCU IT Student | Frontend Developer | Vibecoder
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h1>
                <span>Designing Interfaces.</span>
                <span>Building AI.</span>
                <span>Creating Experiences.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="hero-copy">
                I'm an IT student, Frontend developer, and AI Builder passionate about transforming ideas into intuitive digital products.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="button-row">
                <MagneticButton href="#projects" icon={<IconArrowUpRight size={18} />}>
                  View Projects
                </MagneticButton>
                <MagneticButton href="#contact" variant="secondary" icon={<IconMail size={18} />}>
                  Let's Connect
                </MagneticButton>
              </div>
            </Reveal>
          </div>
          <aside className="floating-card" aria-label="Portfolio focus">
            <IconCube3dSphere size={28} stroke={1.5} />
            <span>AI-powered product thinking with polished interface craft.</span>
          </aside>
        </section>

        {/* ── About ── */}
        <section className="section about" id="about">
          <Reveal className="portrait-wrap">
            <div className="portrait">
              <img src="/portrait.jpg" alt="Dranreb Miguel" />
            </div>
          </Reveal>
          <div className="about-copy">
            <Reveal>
              <h2>Building the bridge between design taste and useful AI.</h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p>
                I am a 3rd-year Information Technology student at Quezon City University focused on beautiful digital experiences,
                frontend development, and practical AI applications. My work blends product clarity, creative systems, and technical execution.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="stat-grid">
                {stats.map(([value, label]) => (
                  <div className="stat" key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Skills ── */}
        <section className="section skills" id="skills">
          <Reveal>
            <div className="section-title">
              <IconSparkles size={24} stroke={1.5} />
              <h2>Skills in orbit</h2>
              <p>Design, frontend, AI, and development skills arranged around the way real products get made.</p>
            </div>
          </Reveal>
          <div className="skill-orbit">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <Reveal key={skill.title} delay={index * 0.05}>
                  <article className="skill-card">
                    <Icon size={28} stroke={1.45} />
                    <h3>{skill.title}</h3>
                    <div>
                      {skill.items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── Projects ── */}
        <section className="section projects" id="projects">
          <Reveal>
            <div className="section-title narrow">
              <h2>Featured projects</h2>
              <p>Large interactive cards built for clarity, depth, and fast scanning.</p>
            </div>
          </Reveal>
          <div className="project-stack">
            {projects.map((project, index) => (
              <Reveal key={project.title} delay={index * 0.06}>
                <TiltCard className="project-card">
                  <div className={`project-visual ${project.gradient}`}>
                    {project.image ? (
                      <img src={project.image} alt={project.title} className="project-screenshot" />
                    ) : (
                      <div className="screen-bars">
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                  </div>
                  <div className="project-content">
                    <div className="project-meta">
                      <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="project-year">{project.year}</span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.desc}</p>
                    <div className="tag-row">
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="project-actions">
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noreferrer">
                          Live Demo <IconArrowUpRight size={16} />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noreferrer">
                          GitHub <IconBrandGithub size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="section timeline-section">
          <Reveal>
            <div className="section-title narrow">
              <h2>Experience timeline</h2>
              <p>A flexible path through education, experiments, design work, and AI-focused builds.</p>
            </div>
          </Reveal>
          <div className="timeline">
            {timeline.map(([title, body], index) => (
              <Reveal key={title} delay={index * 0.05}>
                <article>
                  <span />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Certificates ── */}
        <section className="section" id="certificates">
          <Reveal>
            <div className="section-title narrow">
              <IconCertificate size={24} stroke={1.5} />
              <h2>Certificates</h2>
              <p>Courses, programs, and recognitions earned along the way.</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <Carousel label="Certificates carousel">
              {certificates.map((cert, i) => (
                <article className="carousel-card" key={i}>
                  <div className="carousel-card-visual cert-visual">
                    {cert.image
                      ? <img src={cert.image} alt={cert.title} />
                      : <IconCertificate size={40} stroke={1.2} />}
                  </div>
                  <div className="carousel-card-body">
                    <span className="carousel-card-date">{cert.date}</span>
                    <h3>{cert.title}</h3>
                    <p>{cert.issuer}</p>
                  </div>
                </article>
              ))}
            </Carousel>
          </Reveal>
        </section>

        {/* ── Activities ── */}
        <section className="section" id="activities">
          <Reveal>
            <div className="section-title narrow">
              <IconCalendarEvent size={24} stroke={1.5} />
              <h2>Activities</h2>
              <p>Hackathons, events, and community work I have been part of.</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <Carousel label="Activities carousel">
              {activities.map((act, i) => (
                <article className="carousel-card" key={i}>
                  <div className="carousel-card-visual act-visual">
                    {act.image
                      ? <img src={act.image} alt={act.title} />
                      : <IconCalendarEvent size={40} stroke={1.2} />}
                  </div>
                  <div className="carousel-card-body">
                    <span className="carousel-card-date">{act.date}</span>
                    <h3>{act.title}</h3>
                    <p className="carousel-card-role">{act.role}</p>
                    <p>{act.desc}</p>
                  </div>
                </article>
              ))}
            </Carousel>
          </Reveal>
        </section>

        {/* ── Contact ── */}
        <section className="section contact" id="contact">
          <Reveal>
            <div className="contact-panel">
              <p>Available for design, frontend, and AI product collaborations.</p>
              <h2>Let's build something clear, useful, and memorable.</h2>
              <div className="contact-links">
                <a href="mailto:miguel.dranreb.formoso@gmail.com"><IconMail size={20} /> Email</a>
                <a href="https://www.linkedin.com/in/dranreb-miguel-328304420/?skipRedirect=true" target="_blank" rel="noreferrer"><IconBrandLinkedin size={20} /> LinkedIn</a>
                <a href="https://github.com/migueldranrebformoso-png" target="_blank" rel="noreferrer"><IconBrandGithub size={20} /> GitHub</a>
                <a href="/resume.pdf"><IconDownload size={20} /> Resume</a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <footer>
        <span>© 2026</span>
        <span>Built with React + Three.js</span>
        <span>Designed & Developed by Dranreb Miguel</span>
      </footer>
    </>
  );
}

export default App;
