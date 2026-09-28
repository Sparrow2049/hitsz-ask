"use client";

import { useRef, useState } from "react";
import Image from "next/image";

// Click the logo: plays a short sound and spins it once. Click it
// STREAK_TARGET times in a row, each click landing within
// STREAK_WINDOW_MS of the last, and it plays a second "achievement"
// sound instead, then resets the streak — so another quick run of
// STREAK_TARGET clicks triggers it again.
//
// Needs two audio files that aren't included here on purpose — sourcing
// and embedding actual copyrighted game audio isn't something I can do,
// but you can pull short clips from your own copy of the game for this
// kind of personal, non-commercial fan easter egg. Drop them in as:
//   public/sounds/cloak.mp3         (played on every click)
//   public/sounds/achievement.mp3   (played every STREAK_TARGET quick clicks)
// Until those files exist, clicking still spins the logo — the sound
// just silently no-ops (see playFromStart below).
const CLOAK_SOUND_SRC = "/sounds/cloak.mp3";
const ACHIEVEMENT_SOUND_SRC = "/sounds/achievement.mp3";
const STREAK_TARGET = 10;
const STREAK_WINDOW_MS = 700;

export default function LogoEasterEgg() {
  const cloakAudioRef = useRef<HTMLAudioElement | null>(null);
  const achievementAudioRef = useRef<HTMLAudioElement | null>(null);
  // Plain ref, not state — this is a fast-click counter, re-rendering on
  // every single click for it would be pointless. spinTurns below is the
  // only piece of this that actually needs to be state.
  const streakRef = useRef({ count: 0, lastClickAt: 0 });
  const [spinTurns, setSpinTurns] = useState(0);

  function playFromStart(audio: HTMLAudioElement | null) {
    if (!audio) return;
    audio.currentTime = 0;
    // Only ever called from a click handler, so autoplay restrictions
    // aren't in play — but catch defensively anyway (e.g. the file
    // doesn't exist yet) rather than let it surface as a console error.
    audio.play().catch(() => {});
  }

  function handleClick() {
    const now = Date.now();
    const streak = streakRef.current;
    streak.count = now - streak.lastClickAt <= STREAK_WINDOW_MS ? streak.count + 1 : 1;
    streak.lastClickAt = now;

    setSpinTurns((turns) => turns + 1);
    playFromStart(cloakAudioRef.current);

    if (streak.count >= STREAK_TARGET) {
      playFromStart(achievementAudioRef.current);
      streak.count = 0;
    }
  }

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        aria-label="Waypoint logo — click it a few times"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className="inline-flex cursor-pointer select-none"
      >
        <Image
          src="/logo.png"
          alt=""
          width={28}
          height={28}
          className="rounded-md transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${spinTurns * 360}deg)` }}
        />
      </span>
      <audio ref={cloakAudioRef} src={CLOAK_SOUND_SRC} preload="auto" />
      <audio ref={achievementAudioRef} src={ACHIEVEMENT_SOUND_SRC} preload="auto" />
    </>
  );
}
