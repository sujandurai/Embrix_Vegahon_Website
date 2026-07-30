/* ============================================================
   EMBRIX'26 — VEGATHON  |  script.js
   ============================================================ */

'use strict';

/* ============================================================
   1. PCB CANVAS ANIMATION
   ============================================================ */
(function initPCBCanvas() {
    const canvas = document.getElementById('pcb-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, nodes = [], traces = [], particles = [];
    const NODE_COUNT = 28;
    const TRACE_COLOR = 'rgba(30,144,255,';
    const PARTICLE_COLOR = 'rgba(0,212,255,';

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        buildGraph();
    }

    function rand(min, max) { return min + Math.random() * (max - min); }

    function buildGraph() {
        nodes = [];
        traces = [];
        particles = [];

        // Create nodes on grid with jitter
        const cols = 8, rows = 5;
        const cw = W / cols, ch = H / rows;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (Math.random() < 0.75) {
                    nodes.push({
                        x: cw * c + rand(cw * 0.1, cw * 0.9),
                        y: ch * r + rand(ch * 0.1, ch * 0.9),
                        size: rand(2, 5),
                        opacity: rand(0.3, 0.9),
                        pulsePhase: rand(0, Math.PI * 2),
                    });
                }
            }
        }

        // Connect nearby nodes with PCB-style traces (axis-aligned)
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < W * 0.22 && Math.random() < 0.35) {
                    const mid = {
                        x: Math.random() < 0.5 ? nodes[i].x : nodes[j].x,
                        y: Math.random() < 0.5 ? nodes[i].y : nodes[j].y,
                    };
                    traces.push({
                        from: nodes[i], to: nodes[j], mid,
                        opacity: rand(0.08, 0.25),
                        width: rand(0.5, 1.5),
                    });
                    // Occasionally spawn a particle on this trace
                    if (Math.random() < 0.3) {
                        particles.push({
                            traceIdx: traces.length - 1,
                            t: Math.random(),
                            speed: rand(0.0005, 0.002),
                            size: rand(1.5, 3),
                            opacity: rand(0.6, 1.0),
                        });
                    }
                }
            }
        }
    }

    function getLerpPoint(trace, t) {
        // Two-segment path via mid point
        const { from, to, mid } = trace;
        if (t < 0.5) {
            const lt = t * 2;
            return {
                x: from.x + (mid.x - from.x) * lt,
                y: from.y + (mid.y - from.y) * lt,
            };
        } else {
            const lt = (t - 0.5) * 2;
            return {
                x: mid.x + (to.x - mid.x) * lt,
                y: mid.y + (to.y - mid.y) * lt,
            };
        }
    }

    function draw(ts) {
        ctx.clearRect(0, 0, W, H);

        // Draw traces
        traces.forEach(tr => {
            ctx.beginPath();
            ctx.moveTo(tr.from.x, tr.from.y);
            ctx.lineTo(tr.mid.x, tr.mid.y);
            ctx.lineTo(tr.to.x, tr.to.y);
            ctx.strokeStyle = TRACE_COLOR + tr.opacity + ')';
            ctx.lineWidth = tr.width;
            ctx.stroke();
        });

        // Draw nodes
        const t = ts * 0.001;
        nodes.forEach(n => {
            const pulse = 0.6 + 0.4 * Math.sin(t * 1.2 + n.pulsePhase);
            const alpha = n.opacity * pulse;

            // Outer ring
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = TRACE_COLOR + (alpha * 0.12) + ')';
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
            ctx.fillStyle = TRACE_COLOR + alpha + ')';
            ctx.fill();
        });

        // Draw & move particles
        particles.forEach(p => {
            p.t += p.speed;
            if (p.t > 1) p.t = 0;

            const pos = getLerpPoint(traces[p.traceIdx], p.t);

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = PARTICLE_COLOR + p.opacity + ')';
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(0,212,255,0.8)';
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(draw);
})();

/* ============================================================
   2. NAVBAR
   ============================================================ */
(function initNav() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        hamburger.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                links.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -40% 0px' });

    sections.forEach(s => io.observe(s));
})();

/* ============================================================
   3. AOS (Animate on Scroll)
   ============================================================ */
(function initAOS() {
    const els = document.querySelectorAll('[data-aos]');

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('aos-animate');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    els.forEach(el => io.observe(el));
})();

/* ============================================================
   4. 3D BOARD TILT (mouse parallax)
   ============================================================ */
(function initBoardTilt() {
    const scene = document.getElementById('board-scene');
    const board = document.getElementById('board-3d');
    if (!scene || !board) return;

    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', e => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetX = (e.clientY - cy) / cy * 12;
        targetY = (e.clientX - cx) / cx * -12;
    });

    function animate() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        board.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;
        requestAnimationFrame(animate);
    }
    animate();

    // Touch support
    document.addEventListener('touchmove', e => {
        const t = e.touches[0];
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetX = (t.clientY - cy) / cy * 8;
        targetY = (t.clientX - cx) / cx * -8;
    }, { passive: true });
})();

/* ============================================================
   5. ABOUT BOARD TILT
   ============================================================ */
(function initAboutBoard() {
    const board = document.getElementById('about-board');
    if (!board) return;

    board.addEventListener('mousemove', e => {
        const rect = board.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rx = (e.clientY - cy) / (rect.height / 2) * 10;
        const ry = (e.clientX - cx) / (rect.width / 2) * -10;
        board.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
    });

    board.addEventListener('mouseleave', () => {
        board.style.transform = '';
    });
})();

/* ============================================================
   6. TIMELINE VISIBILITY
   ============================================================ */
(function initTimeline() {
    const items = document.querySelectorAll('.tl-item');
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelector('.tl-dot-inner').style.background = 'var(--blue)';
                e.target.querySelector('.tl-dot-inner').style.borderColor = 'var(--blue)';
                e.target.querySelector('.tl-dot-inner').style.boxShadow = '0 0 14px var(--blue-glow)';
            }
        });
    }, { threshold: 0.5 });
    items.forEach(i => io.observe(i));
})();

/* ============================================================
   7. REGISTRATION FORM
   ============================================================ */
(function initForm() {
    const form = document.getElementById('registration-form');
    const modal = document.getElementById('success-modal');
    const closeBtn = document.getElementById('success-close');
    const successData = document.getElementById('success-data');

    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();

        const teamName = form.querySelector('#team-name').value.trim();
        const institution = form.querySelector('#institution').value.trim();
        const track = form.querySelector('#track-select').value;
        const leaderName = form.querySelector('#leader-name').value.trim();
        const leaderEmail = form.querySelector('#leader-email').value.trim();
        const ideaTitle = form.querySelector('#idea-title').value.trim();

        successData.innerHTML = `
            <strong style="color:var(--blue)">Team:</strong> ${teamName}<br>
            <strong style="color:var(--blue)">Institution:</strong> ${institution}<br>
            <strong style="color:var(--blue)">Track:</strong> ${track}<br>
            <strong style="color:var(--blue)">Leader:</strong> ${leaderName}<br>
            <strong style="color:var(--blue)">Email:</strong> ${leaderEmail}<br>
            <strong style="color:var(--blue)">Project:</strong> ${ideaTitle}
        `;

        modal.classList.add('active');
        form.reset();
    });

    const closeModal = () => modal.classList.remove('active');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

/* ============================================================
   8. COUNTER ANIMATION (stats)
   ============================================================ */
(function initCounters() {
    const statVals = document.querySelectorAll('.stat-val');

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const text = el.textContent;
            const num = parseFloat(text);
            if (isNaN(num)) return;

            const suffix = text.replace(/[\d.]/g, '');
            let start = 0;
            const duration = 1200;
            const startTime = performance.now();

            function update(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                el.textContent = (num * ease).toFixed(num % 1 !== 0 ? 1 : 0) + suffix;
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
            io.unobserve(el);
        });
    }, { threshold: 0.8 });

    statVals.forEach(el => io.observe(el));
})();

/* ============================================================
   9. SMOOTH SCROLL for anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

/* ============================================================
   10. HAMBURGER ANIMATION
   ============================================================ */
(function () {
    const burger = document.getElementById('hamburger');
    if (!burger) return;
    const style = document.createElement('style');
    style.textContent = `
        .hamburger.active span:first-child { transform: translateY(7px) rotate(45deg); }
        .hamburger.active span:last-child { transform: translateY(-7px) rotate(-45deg); }
        .nav-link.active { color: var(--white); }
    `;
    document.head.appendChild(style);
})();

/* ============================================================
   11. CREATIVE TRACK CARDS 3D MOUSE PARALLAX TILT
   ============================================================ */
(function initTrackCardsTilt() {
    const cards = document.querySelectorAll('.track-box');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rx = (y - cy) / cy * -6;
            const ry = (x - cx) / cx * 6;
            card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
})();

/* ============================================================
   12. TRANSPARENT TRACK DOMAINS MODAL HANDLER
   ============================================================ */
const trackData = {
    1: {
        badge: "TRACK 01",
        title: "Track 1 – Hardware Innovation",
        desc: "Design, prototype, and validate innovative hardware solutions using the VEGA Processor platform to solve real-world challenges in the following domains:",
        color: "#00D4FF",
        domains: [
            "Safety, Disaster & Emergency Response",
            "Healthcare & Assistive Technology",
            "Smart Agriculture & Food Security",
            "Smart Cities & Infrastructure",
            "Fiction in Real Life – Enhanced Gadgets"
        ]
    },
    2: {
        badge: "TRACK 02",
        title: "Track 2 – Edge AI & TinyML Challenge",
        desc: "Develop intelligent, low-power AI solutions powered by Edge AI and TinyML using the VEGA Processor platform. Participants are encouraged to build innovative on-device AI applications in the following domains:",
        color: "#C084FC",
        domains: [
            "Predictive Analytics & Anomaly Detection",
            "AI for Smart IoT & Connected Devices",
            "Intelligent Monitoring & Automation",
            "Edge AI for Real-Time Decision Making",
            "Autonomous Systems & Intelligent Robotics"
        ]
    }
};

let trackAutoCloseTimer = null;

window.closeTrackDomains = function () {
    const modal = document.getElementById('track-domains-modal');
    if (modal) modal.classList.remove('active');

    // Auto close any active inline panels
    document.querySelectorAll('.track-inline-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Reset button labels
    document.querySelectorAll('.btn-track-transparent span').forEach(span => {
        span.textContent = 'View Transparent Overview';
    });

    if (trackAutoCloseTimer) {
        clearTimeout(trackAutoCloseTimer);
        trackAutoCloseTimer = null;
    }
};

window.toggleTrackOverview = function (trackId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const panel = document.getElementById(`track-panel-${trackId}`);
    const btn = document.getElementById(`btn-track-${trackId}`);
    const isCurrentlyActive = panel && panel.classList.contains('active');

    // Close any open panels / modals
    window.closeTrackDomains();

    if (!isCurrentlyActive && panel) {
        panel.classList.add('active');

        if (btn) {
            const span = btn.querySelector('span');
            if (span) {
                span.textContent = 'Close Transparent Overview';
            }
        }

        // Auto-close automatically after 10 seconds if user leaves it open
        trackAutoCloseTimer = setTimeout(() => {
            window.closeTrackDomains();
        }, 10000);
    }
};

window.openTrackDomains = function (trackId) {
    const modal = document.getElementById('track-domains-modal');
    const header = document.getElementById('track-modal-header');
    const body = document.getElementById('track-modal-body');
    if (!modal || !header || !body) return;

    const data = trackData[trackId];
    if (!data) return;

    header.innerHTML = `
        <span class="modal-badge-pill" style="border-color: ${data.color}; color: ${data.color}">${data.badge}</span>
        <h3 class="modal-track-title" style="color: ${data.color}">${data.title}</h3>
    `;

    let domainsHtml = data.domains.map((dom, i) => `
        <div class="modal-domain-item" style="border-left-color: ${data.color}">
            <span class="m-num" style="background: ${data.color}22; color: ${data.color}">0${i + 1}</span>
            <span class="m-text">${dom}</span>
        </div>
    `).join('');

    body.innerHTML = `
        <p class="modal-track-desc">${data.desc}</p>
        <div class="modal-domains-list">
            ${domainsHtml}
        </div>
    `;

    modal.classList.add('active');
};

document.addEventListener('click', (e) => {
    const modal = document.getElementById('track-domains-modal');
    if (modal && modal.classList.contains('active') && e.target === modal) {
        window.closeTrackDomains();
        return;
    }

    // Auto-close if clicking outside track cards when an inline panel is open
    const isInsideTrackBox = e.target.closest('.track-box') || e.target.closest('.track-modal-card');
    if (!isInsideTrackBox) {
        const hasActivePanel = document.querySelector('.track-inline-panel.active');
        if (hasActivePanel) {
            window.closeTrackDomains();
        }
    }
});

/* ============================================================
   LIVE COUNTDOWN TIMER CLOCK
   ============================================================ */
(function initCountdownTimer() {
    // Target Event Date: September 11, 2026 09:00:00 IST
    const targetDate = new Date('2026-09-11T09:00:00+05:30').getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        const dEl = document.getElementById('cd-days');
        const hEl = document.getElementById('cd-hours');
        const mEl = document.getElementById('cd-mins');
        const sEl = document.getElementById('cd-secs');

        if (!dEl || !hEl || !mEl || !sEl) return;

        if (diff <= 0) {
            dEl.textContent = '00';
            hEl.textContent = '00';
            mEl.textContent = '00';
            sEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        dEl.textContent = String(days).padStart(2, '0');
        hEl.textContent = String(hours).padStart(2, '0');
        mEl.textContent = String(mins).padStart(2, '0');
        sEl.textContent = String(secs).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
})();
