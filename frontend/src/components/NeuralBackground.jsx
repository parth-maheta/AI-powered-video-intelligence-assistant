import { useEffect, useRef } from 'react';

/**
 * Neural Network / Constellation animated background.
 * Uses Canvas 2D for a performant particle system with:
 * - Floating particles (nodes) with random drift
 * - Dynamic edge connections between nearby particles
 * - Mouse-reactive glow and attraction
 * - Configurable intensity for dimming on results page
 */
export default function NeuralBackground({ intensity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let mouse = { x: -9999, y: -9999 };

    const PARTICLE_COUNT = 130;
    const CONNECTION_DISTANCE = 140;
    const MOUSE_RADIUS = 220;

    // ── Resize ──
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Create Particles ──
    const colors = [
      { h: 262, s: 83, l: 58 },  // purple
      { h: 217, s: 91, l: 60 },  // blue
      { h: 192, s: 95, l: 43 },  // cyan
      { h: 239, s: 84, l: 67 },  // indigo
      { h: 330, s: 81, l: 60 },  // pink
    ];

    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const c = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 0.8,
        color: c,
        baseAlpha: 0.4 + Math.random() * 0.4,
      };
    });

    // ── Mouse Tracking ──
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── Animation Loop ──
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentIntensity = intensity;

      // Update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges with padding
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        // Mouse attraction (subtle)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.008;
          p.vx += dx * force * 0.02;
          p.vy += dy * force * 0.02;
        }

        // Velocity damping
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Draw particle
        const alpha = p.baseAlpha * currentIntensity;
        const { h, s, l } = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * currentIntensity, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
        ctx.fill();

        // Mouse proximity glow
        if (dist < MOUSE_RADIUS) {
          const glowAlpha = (1 - dist / MOUSE_RADIUS) * 0.25 * currentIntensity;
          const glowRadius = p.radius * 4 * currentIntensity;
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
          gradient.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${glowAlpha})`);
          gradient.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.18 * currentIntensity;

            // Gradient line between two particle colors
            const c1 = particles[i].color;
            const c2 = particles[j].color;

            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            gradient.addColorStop(0, `hsla(${c1.h}, ${c1.s}%, ${c1.l}%, ${alpha})`);
            gradient.addColorStop(1, `hsla(${c2.h}, ${c2.s}%, ${c2.l}%, ${alpha})`);

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} className="neural-bg" />;
}
