"use client";

import React, { useEffect, useRef, useState } from "react";

interface ProjectsSliderProps {
  children: React.ReactNode;
}

export default function ProjectsSlider({ children }: ProjectsSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSliderActive, setIsSliderActive] = useState(false);

  // Interaction tracking state
  const isInteracting = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dragging state
  const isMouseDown = useRef(false);
  const dragMoved = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // High-precision scroll position reference to prevent Safari integer rounding truncation bugs
  const scrollLeftRef = useRef(0);

  // Animation frame
  const animationFrameRef = useRef<number | null>(null);
  const lastTime = useRef<number>(0);
  const speedPixelsPerSecond = 40; // matches normal CSS scroll speed (approx 56s full loop)

  const userInteracted = () => {
    isInteracting.current = true;
    
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    
    resumeTimeoutRef.current = setTimeout(() => {
      isInteracting.current = false;
      // Reset lastTime to avoid jump on resumption
      lastTime.current = 0;
    }, 3000);
  };

  useEffect(() => {
    // Activate slider classes on client-side mount (Progressive Enhancement fallback check)
    setIsSliderActive(true);

    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Sync high-precision scroll position ref on mount
    scrollLeftRef.current = container.scrollLeft;

    // 1. Wheel translation: Translate vertical wheel delta to horizontal scroll
    const handleWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      
      e.preventDefault();
      
      container.scrollLeft += delta;
      scrollLeftRef.current = container.scrollLeft;
      userInteracted();
    };

    // 2. Mouse/Touch interactions and click blocker
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      isMouseDown.current = true;
      dragMoved.current = false;
      startX.current = e.pageX - container.offsetLeft;
      scrollLeftStart.current = container.scrollLeft;
      
      container.style.scrollBehavior = "auto"; // Disable smooth scrolling during drag
      container.style.cursor = "grabbing";
      userInteracted();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX.current) * 1.5; // Drag speed multiplier
      
      if (Math.abs(walk) > 5) {
        dragMoved.current = true;
      }
      
      container.scrollLeft = scrollLeftStart.current - walk;
      scrollLeftRef.current = container.scrollLeft;
      userInteracted();
    };

    const handleMouseUpOrLeave = () => {
      isMouseDown.current = false;
      if (container) {
        container.style.cursor = "";
        container.style.scrollBehavior = "";
      }
    };

    const handleTouchStart = () => {
      container.style.scrollBehavior = "auto";
      userInteracted();
    };

    const handleTouchEnd = () => {
      container.style.scrollBehavior = "";
    };

    // Sync ref during standard scrolling (like touch swipe momentum or trackpad scroll)
    const handleScroll = () => {
      if (isInteracting.current && container) {
        scrollLeftRef.current = container.scrollLeft;
      }
    };

    // Intercept clicks to block page traversal if a drag happened
    const handleClickCapture = (e: MouseEvent) => {
      if (dragMoved.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Register event listeners
    // Wheel event must be non-passive to allow preventDefault()
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUpOrLeave);
    container.addEventListener("mouseleave", handleMouseUpOrLeave);
    container.addEventListener("click", handleClickCapture, true); // capture phase
    container.addEventListener("scroll", handleScroll, { passive: true });

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUpOrLeave);
      container.removeEventListener("mouseleave", handleMouseUpOrLeave);
      container.removeEventListener("click", handleClickCapture, true);
      container.removeEventListener("scroll", handleScroll);

      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // 3. Infinite loop bounds and auto-scroll animation loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animate = (time: number) => {
      if (!lastTime.current) {
        lastTime.current = time;
      }
      const delta = (time - lastTime.current) / 1000;
      lastTime.current = time;

      if (!isInteracting.current && container) {
        // Increment the high-precision reference to avoid Safari rounding/truncating to 0 pixels
        scrollLeftRef.current += speedPixelsPerSecond * delta;
        
        // Visual wrap-around for infinite carousel:
        const halfWidth = container.scrollWidth / 2;
        if (halfWidth > 0) {
          if (scrollLeftRef.current >= halfWidth + 1) {
            scrollLeftRef.current -= halfWidth;
          } else if (scrollLeftRef.current <= 0) {
            scrollLeftRef.current += halfWidth;
          }
        }

        // Write the high-precision rounded integer value back to DOM
        container.scrollLeft = Math.round(scrollLeftRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={`projects-auto-section ${isSliderActive ? "is-slider" : ""}`}
      aria-label="Auto-scrolling projects"
    >
      {children}
    </section>
  );
}
