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
    const timer = setTimeout(onDone, reduced ? 400 : 3000);
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
        y: "-100%",
        transition: { duration: 0.75, ease: [0.77, 0, 0.175, 1] as [number,number,number,number] },
      }}
    >
      <div className="loader-items">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            className="loader-item"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -16,
              transition: {
                delay: i * 0.05,
                duration: 0.3,
                ease: [0.23, 1, 0.32, 1] as [number,number,number,number],
              },
            }}
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

// ── Tech logo marquee data ────────────────────────────────────────────────────
const techLogos = [
  {
    name: "Figma",
    svg: <svg viewBox="0 0 38 57" fill="none"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE"/><path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" fill="#0ACF83"/><path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z" fill="#FF7262"/><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/></svg>,
  },
  {
    name: "React",
    svg: <svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="8" fill="#61DAFB"/><ellipse cx="50" cy="50" rx="47" ry="18" stroke="#61DAFB" strokeWidth="3"/><ellipse cx="50" cy="50" rx="47" ry="18" stroke="#61DAFB" strokeWidth="3" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="47" ry="18" stroke="#61DAFB" strokeWidth="3" transform="rotate(120 50 50)"/></svg>,
  },
  {
    name: "Next.js",
    svg: <svg viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="90" fill="#000"/><path d="M149 90c0 32.6-26.4 59-59 59S31 122.6 31 90s26.4-59 59-59 59 26.4 59 59z" fill="#000"/><path d="M72 116V64l60 69.4c-10.7 8.5-24.3 13.6-39 13.6A58.8 58.8 0 0 1 72 116z" fill="white"/><path d="M120.3 112.3V64h-14v32.3L120.3 112.3z" fill="white"/></svg>,
  },
  {
    name: "TypeScript",
    svg: <svg viewBox="0 0 256 256" fill="none"><rect width="256" height="256" rx="20" fill="#3178C6"/><path d="M150 200v-26.4c4.3 2.8 9.4 4.9 15 6.1 5.7 1.2 11.3 1.5 16.5.9 2.5-.3 4.8-.9 6.8-1.8 2-.9 3.7-2.1 5-3.5 1.3-1.4 2-3 2.1-4.8.1-2.2-.6-4.2-2.2-6-1.5-1.7-3.6-3.3-6.2-4.7-2.6-1.4-7.4-3.7-14.4-6.9-5.7-2.6-10.5-5.3-14.3-8.1-3.8-2.8-6.7-6-8.7-9.6-2-3.6-3-7.8-3-12.6 0-6.3 1.7-11.8 5.2-16.5 3.5-4.7 8.3-8.3 14.5-10.8 6.2-2.5 13.3-3.7 21.3-3.7 7.4 0 13.8.6 19.2 1.7v25.5c-3.6-2-7.5-3.5-11.7-4.4-4.2-.9-8.3-1.2-12.3-.8-2.4.2-4.5.8-6.4 1.6-1.8.8-3.3 1.9-4.3 3.3-1 1.4-1.5 3-1.4 4.8.1 2 .9 3.8 2.4 5.4 1.5 1.6 3.7 3.1 6.5 4.5l13.8 6.4c8.6 4 14.8 8.3 18.5 12.9 3.7 4.6 5.6 10.2 5.6 16.8 0 6.5-1.8 12.1-5.3 16.8-3.5 4.7-8.5 8.2-14.9 10.6-6.4 2.4-13.9 3.5-22.4 3.4-8-.2-15.4-1.4-22.3-3.8zM96 120H64V96h90v24h-32v80H96v-80z" fill="white"/></svg>,
  },
  {
    name: "Tailwind",
    svg: <svg viewBox="0 0 54 33" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M27 0C19.8 0 15.3 3.6 13.5 10.8c2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" fill="#06B6D4"/></svg>,
  },
  {
    name: "HTML",
    svg: <svg viewBox="0 0 452 520" fill="none"><path d="M41 460L0 0h451l-41 460-185 52L41 460z" fill="#E44D26"/><path d="M226 472l149-41 35-394H226V472z" fill="#F16529"/><path d="M226 208h-75l-5-58h80V92H84l13 148h129v-32zM226 355l-64-17-4-45h-56l8 90 116 32v-60z" fill="#EBEBEB"/><path d="M226 208v68h70l-7 77-63 17v62l116-32 8-90 13-102H226zM226 150V92h126l-4 58H226z" fill="white"/></svg>,
  },
  {
    name: "CSS",
    svg: <svg viewBox="0 0 452 520" fill="none"><path d="M41 460L0 0h451l-41 460-185 52L41 460z" fill="#1172B8"/><path d="M226 472l149-41 35-394H226V472z" fill="#33AADD"/><path d="M226 308h-62l-4-45h66v-56H95l13 148h118v-47zM226 150H95l4 44h127V150zM226 355v49l63-17 7-79H236l-3 30-7 2v15z" fill="#EBEBEB"/><path d="M226 308v47l63-17 7-77H226v47h43l-3 30-40 10z" fill="white"/><path d="M226 194v56h69l-4 44H226v56h62l8-90 4-66H226z" fill="white"/><path d="M226 150v44h122l-4-44H226z" fill="white"/></svg>,
  },
  {
    name: "JavaScript",
    svg: <svg viewBox="0 0 256 256" fill="none"><rect width="256" height="256" fill="#F7DF1E"/><path d="M67.312 213.932l19.59-11.856c3.78 6.701 7.218 12.371 15.465 12.371 7.905 0 12.893-3.092 12.893-15.12v-81.798h24.058v82.138c0 24.917-14.606 36.259-35.916 36.259-19.245 0-30.416-9.967-36.09-21.994M152.381 211.354l19.588-11.341c5.157 8.421 11.859 14.607 23.715 14.607 9.969 0 16.325-4.984 16.325-11.858 0-8.248-6.53-11.17-17.528-15.98l-6.013-2.58c-17.357-7.387-28.87-16.667-28.87-36.257 0-18.044 13.747-31.792 35.228-31.792 15.294 0 26.292 5.328 34.196 19.247L210.29 147.43c-4.125-7.389-8.591-10.31-15.465-10.31-7.046 0-11.514 4.468-11.514 10.31 0 7.217 4.468 10.14 14.778 14.608l6.014 2.577c20.45 8.765 31.963 17.7 31.963 37.804 0 21.654-17.012 33.51-39.867 33.51-22.339 0-36.774-10.654-43.819-24.574" fill="#323330"/></svg>,
  },
  {
    name: "Git",
    svg: <svg viewBox="0 0 92 92" fill="none"><path d="M90.156 41.965L50.036 1.848a5.918 5.918 0 0 0-8.372 0l-8.328 8.332 10.566 10.566a7.03 7.03 0 0 1 7.23 1.684 7.043 7.043 0 0 1 1.673 7.277l10.183 10.184a7.026 7.026 0 0 1 7.278 1.672 7.04 7.04 0 0 1 0 9.957 7.045 7.045 0 0 1-9.961 0 7.038 7.038 0 0 1-1.532-7.63L49.73 33.516v27.085a7.03 7.03 0 0 1 1.86 1.297 7.04 7.04 0 0 1 0 9.957 7.045 7.045 0 0 1-9.961 0 7.04 7.04 0 0 1 0-9.957 7.074 7.074 0 0 1 2.304-1.532V33.033a7.074 7.074 0 0 1-2.304-1.532 7.047 7.047 0 0 1-1.516-7.672L29.73 13.273 1.734 41.273a5.918 5.918 0 0 0 0 8.371L41.855 89.76a5.92 5.92 0 0 0 8.37 0l39.93-39.926a5.924 5.924 0 0 0 0-8.868" fill="#F05032"/></svg>,
  },
  {
    name: "Node.js",
    svg: <svg viewBox="0 0 256 289" fill="none"><path d="M128 288.464c-3.975 0-7.685-1.06-11.13-2.915l-35.247-20.936c-5.3-2.98-2.65-3.975-1.06-4.64 7.155-2.385 8.48-2.915 15.965-7.02.796-.53 1.856-.265 2.65.265l27.032 16.1c1.06.53 2.385.53 3.31 0l105.739-61.065c1.06-.53 1.59-1.59 1.59-2.915V83.688c0-1.325-.53-2.385-1.59-2.915L128.928 19.9c-1.06-.53-2.385-.53-3.31 0L19.879 80.773c-1.06.53-1.59 1.856-1.59 2.915v121.866c0 1.06.53 2.385 1.59 2.915l28.955 16.76c15.7 7.95 25.507-1.325 25.507-10.6V95.613c0-1.59 1.325-3.18 3.18-3.18h13.58c1.59 0 3.18 1.325 3.18 3.18v118.951c0 20.936-11.395 32.86-31.27 32.86-6.095 0-10.865 0-24.18-6.625L9.28 223.682C3.71 220.502 0 214.67 0 208.574V86.44c0-6.095 3.71-11.926 9.28-15.106L118.87.79c5.3-2.915 12.455-2.915 17.755 0l109.45 70.546c5.57 3.18 9.28 9.01 9.28 15.106v121.866c0 6.095-3.71 11.926-9.28 15.106L139.605 285.55c-3.445 1.856-7.155 2.915-11.605 2.915z" fill="#539E43"/><path d="M161.074 209.504c-46.145 0-55.82-21.2-55.82-39.09 0-1.59 1.325-3.18 3.18-3.18h13.845c1.59 0 2.915 1.06 2.915 2.65 2.12 14.11 8.215 20.936 35.88 20.936 22.13 0 31.54-4.97 31.54-16.7 0-6.89-2.65-11.925-37.47-15.37-29.09-2.915-47.07-9.28-47.07-32.595 0-21.466 18.11-34.25 48.44-34.25 34.12 0 50.88 11.925 53 37.2.265 1.59-1.06 3.18-2.65 3.18h-13.845c-1.325 0-2.65-1.06-2.915-2.385-3.31-14.64-11.66-19.345-33.59-19.345-24.71 0-27.56 8.615-27.56 15.106 0 7.95 3.445 10.07 36.41 14.375 32.7 4.24 48.13 10.335 48.13 33.385-.265 23.315-19.345 36.36-52.47 36.36l.045.728z" fill="#539E43"/></svg>,
  },
  {
    name: "Firebase",
    svg: <svg viewBox="0 0 32 32" fill="none"><path d="M19.62 11.558l-3.203 2.98-2.972-5.995 1.538-3.448c.4-.7 1.024-.692 1.414 0z" fill="#FFA000"/><path d="M13.445 8.543l2.972 5.995-11.97 11.136z" fill="#F57F17"/><path d="M23.123 7.003c.572-.55 1.164-.362 1.315.417l3.116 18.105-10.328 6.2c-.36.2-1.32.286-1.32.286s-.874-.104-1.207-.3L4.447 25.674z" fill="#FFCA28"/><path d="M13.445 8.543l-8.998 17.13L8.455 6.802c.148-.78.71-1.017 1.257-.527z" fill="#FFA000"/></svg>,
  },
  {
    name: "Python",
    svg: <svg viewBox="0 0 256 255" fill="none"><path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z" fill="url(#py_a)"/><path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z" fill="url(#py_b)"/><defs><linearGradient id="py_a" x1="47.197" y1="46.845" x2="199.397" y2="214.816" gradientUnits="userSpaceOnUse"><stop stopColor="#387EB8"/><stop offset="1" stopColor="#366994"/></linearGradient><linearGradient id="py_b" x1="46.157" y1="40.104" x2="215.086" y2="199.502" gradientUnits="userSpaceOnUse"><stop stopColor="#FFE052"/><stop offset="1" stopColor="#FFC331"/></linearGradient></defs></svg>,
  },
  {
    name: "PHP",
    svg: <svg viewBox="0 0 256 134" fill="none"><ellipse cx="128" cy="67" rx="128" ry="67" fill="#8892BF"/><path d="M38.9 95.5l14.1-71.9H87c14 0 21.2 6.5 21.2 17.9 0 16.3-12.2 26.7-29.7 26.7H63.4L59.6 95.5H38.9zm27.1-43.1l-3.1 16h10.6c7.5 0 12.6-3.9 12.6-10.5 0-4.4-2.8-5.5-7.5-5.5H66zM113.2 95.5l14.1-71.9H147l-3.9 19.5h17.2c14 0 20.2 6 20.2 15.8 0 17.3-12.1 36.6-36.4 36.6H113.2zm29.3-17.1h7.5c8.5 0 14.3-8.1 14.3-16.1 0-4.4-2.5-6-7-6h-9.8l-5 22.1zM195.5 95.5l14.1-71.9h19.7l-5.6 28.4h18.9l5.6-28.4h19.7L254 95.5h-19.7l5.8-29.4h-18.9l-5.8 29.4H195.5z" fill="white"/></svg>,
  },
];

// ── Tech Marquee ─────────────────────────────────────────────────────────────
function TechMarquee() {
  const reduced = useReducedMotion();
  const items = [...techLogos, ...techLogos];
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <motion.div
        className="marquee-track"
        animate={reduced ? {} : { x: ["0%", "-50%"] }}
        transition={{ duration: 25, ease: "linear", repeat: Infinity }}
      >
        {items.map((tech, i) => (
          <div className="marquee-item" key={`${tech.name}-${i}`}>
            <div className="marquee-logo">{tech.svg}</div>
            <span className="marquee-name">{tech.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

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
          <Reveal delay={0.1}>
            <TechMarquee />
          </Reveal>
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
