"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const easeFlow = [0.25, 0.1, 0.25, 1];
const tickerText =
  "FOOTBALL ⚡️ F1 ⚡️ CRICKET ⚡️ BASKETBALL ⚡️ FREE SHIPPING";
const repeatedTicker = `${tickerText}   ${tickerText}   ${tickerText}   `;

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-10">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <video
          className="absolute inset-0 h-full w-full object-cover object-[56%_center] sm:object-center"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/jersey_website_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(33,212,253,0.28),transparent_32%),radial-gradient(circle_at_78%_24%,rgba(255,60,172,0.25),transparent_34%),linear-gradient(to_bottom,rgba(0,0,0,0.36)_0%,rgba(0,0,0,0.74)_58%,#0A0A0A_100%)]" />
      </div>

      <motion.div
        className="absolute inset-x-0 top-0 z-20 px-4 pt-5 sm:px-6 lg:px-10"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: easeFlow }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between">
          <div className="rounded-2xl border border-white/12 bg-black/50 p-2 backdrop-blur-md">
            <div className="relative h-[76px] w-[132px] overflow-hidden rounded-xl sm:h-[94px] sm:w-[164px] lg:h-[106px] lg:w-[184px]">
              <Image
                src="/jersey_logo.png"
                alt="Jersea official logo"
                fill
                priority
                sizes="(max-width: 640px) 132px, (max-width: 1024px) 164px, 184px"
                className="object-cover object-[center_54%]"
              />
            </div>
          </div>
          <span className="mt-2 rounded-full border border-jersea-neonBlue/55 bg-black/45 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-jersea-neonBlue backdrop-blur-sm sm:text-xs">
            Official Store
          </span>
        </div>
      </motion.div>

      <motion.div
        className="relative mx-auto w-full max-w-7xl"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: easeFlow }}
      >
        <p className="mb-5 inline-flex items-center rounded-full border border-jersea-neonBlue/60 bg-black/35 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-jersea-neonBlue">
          Drop 01 // Streetwear Jerseys
        </p>
        <h1 className="headline mb-5 text-6xl uppercase leading-[0.9] text-white sm:text-7xl md:text-8xl lg:text-[10rem]">
          WEAR THE HYPE.
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-slate-200 sm:text-base md:text-lg">
          Limited retro kits, race-day fits, and match-day classics built for
          the street. Pick your size, lock your drop, and check out in seconds.
        </p>

        <motion.a
          href="#marketplace"
          className="cta-glow inline-flex items-center rounded-full bg-jersea-neonBlue px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-black shadow-neon transition-colors duration-300 hover:bg-jersea-volt hover:shadow-neon-strong"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3, ease: easeFlow }}
        >
          SHOP THE DROP
        </motion.a>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 overflow-hidden border-y border-white/10 bg-black/65 backdrop-blur-sm">
        <motion.div
          className="whitespace-nowrap py-3 text-xs font-semibold uppercase tracking-[0.24em] text-jersea-neonBlue sm:text-sm"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          <span className="mr-8">{repeatedTicker}</span>
          <span>{repeatedTicker}</span>
        </motion.div>
      </div>
    </section>
  );
}
