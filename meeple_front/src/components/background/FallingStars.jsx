import React, { useEffect } from "react";

const FallingStars = () => {
  useEffect(() => {
    const createStar = () => {
      const star = document.createElement("div");
      star.className = "star";

      // Random starting position
      const startingX = Math.random() * window.innerWidth;
      star.style.left = `${startingX}px`;
      star.style.top = "-2px";

      // Random size between 1 and 3 pixels
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      // Random animation duration between 2 and 6 seconds
      const duration = Math.random() * 4 + 2;
      star.style.animation = `falling-stars ${duration}s linear`;

      document.body.appendChild(star);

      // Remove the star after animation
      star.addEventListener("animationend", () => {
        star.remove();
      });
    };

    // Create new star every 200ms
    const interval = setInterval(createStar, 200);

    return () => {
      clearInterval(interval);
      // Clean up existing stars
      const stars = document.querySelectorAll(".star");
      stars.forEach((star) => star.remove());
    };
  }, []);

  return null;
};

export default FallingStars;
