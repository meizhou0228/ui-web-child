import confetti from 'canvas-confetti';

/** Celebrate a single check-in with a quick burst of small confetti pieces. */
export function celebrateCheckIn(origin?: { x: number; y: number }) {
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 35,
    gravity: 0.9,
    ticks: 100,
    origin: origin ?? { y: 0.6 },
    colors: ['#7DD3FC', '#FCD34D', '#FECACA', '#A7F3D0', '#C4B5FD'],
    scalar: 0.9,
  });
}

/** Bigger burst for milestone unlocks. */
export function celebrateMilestone() {
  const duration = 1500;
  const end = Date.now() + duration;
  const fire = () => {
    confetti({
      particleCount: 80,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#FCD34D', '#FECACA', '#7DD3FC', '#A7F3D0', '#C4B5FD'],
      shapes: ['star', 'circle'],
      scalar: 1.2,
    });
    if (Date.now() < end) requestAnimationFrame(fire);
  };
  fire();
}

/** Burst at chest-opening for redemption. */
export function celebrateRedemption() {
  confetti({
    particleCount: 100,
    spread: 110,
    startVelocity: 40,
    origin: { y: 0.5 },
    colors: ['#FCD34D', '#FECACA'],
    shapes: ['star'],
    scalar: 1.1,
  });
}
