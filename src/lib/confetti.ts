import confetti from "canvas-confetti";

export const celebrateSuccess = () => {
  // Saffron and Green colored confetti for Indian theme
  const colors = ["#FF9933", "#138808", "#ffffff"];

  const end = Date.now() + 1500;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export const burstConfetti = () => {
  const colors = ["#FF9933", "#138808", "#ffffff"];

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
  });
};
