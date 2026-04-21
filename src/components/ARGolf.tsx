"use client";

import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, FaceLandmarker } from "@mediapipe/tasks-vision";

type Ball = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
};

type Hole = {
    id: number;
    x: number;
    y: number;
    vx: number;
    radius: number;
};

const FINGER_INDEXES = [8, 12];
const SIDE_MARGIN = 40;
const TOP_MARGIN = 0;
const BOTTOM_WALL = 110;

export default function ARGolf() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [status, setStatus] = useState("Initializing...");
    const [effect, setEffect] = useState<'win' | 'loss' | null>(null);
    const [holeSpeed, setHoleSpeed] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [isHardMode, setIsHardMode] = useState(false);

    const ballsRef = useRef<Ball[]>([]);
    const holeRef = useRef<Hole | null>(null);
    const fingersRef = useRef<Record<number, { x: number, y: number, vx: number, vy: number }>>({});
    const noseRef = useRef<{ x: number, y: number, vx: number, vy: number } | null>(null);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const isHardModeRef = useRef(false);
    const lastTimeRef = useRef(performance.now());
    const ballTrailsRef = useRef<Record<number, {x: number, y: number}[]>>({});
    const markerTrailsRef = useRef<{x: number, y: number}[]>([]);

    const missAudioRef = useRef<HTMLAudioElement | null>(null);
    const winAudioRef = useRef<HTMLAudioElement | null>(null);
    const fliesRef = useRef<{ x: number, y: number, vx: number, vy: number }[]>([]);
    const windParticlesRef = useRef<{ x: number, y: number, speed: number, length: number }[]>([]);
    const grassEdgesRef = useRef<{ left: number[], right: number[], bottom: number[] }>({ left: [], right: [], bottom: [] });

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (effect) {
            timer = setTimeout(() => setEffect(null), 2000);
        }
        return () => clearTimeout(timer);
    }, [effect]);

    const initializeGame = async () => {
        setIsStarted(true);
        setStatus("Starting...");
        missAudioRef.current = new Audio("/sounds/fahh.mp3");
        winAudioRef.current = new Audio("/sounds/ooh.mp3");
        missAudioRef.current.load();
        winAudioRef.current.load();

        ballsRef.current = Array.from({ length: 3 }, (_, i) => ({
            id: i, x: 400, y: 300, vx: 0, vy: 0, radius: 12
        }));

        holeRef.current = { id: 0, x: 400, y: 45, vx: 0, radius: 36 };

        // Initialize flies
        fliesRef.current = Array.from({ length: 20 }, () => ({
            x: Math.random() * 1280,
            y: Math.random() * 720,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        }));

        // Cache grass offsets for smoothness
        grassEdgesRef.current = {
            left: Array.from({ length: 100 }, () => Math.random() * 10),
            right: Array.from({ length: 100 }, () => Math.random() * 10),
            bottom: Array.from({ length: 200 }, () => Math.random() * 12),
        };

        startCamera();
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => initAI();
            }
        } catch (err) {
            setStatus("Camera Failed");
        }
    };

    const initAI = async () => {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            
            // Hand Landmarker (Standard)
            handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            });

            // Face Landmarker (Hard Mode)
            faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO"
            });

            setStatus("Ready to Play!");
            renderLoop();
        } catch (err) {
            console.error(err);
            setStatus("AI Error");
        }
    };

    const renderLoop = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const video = videoRef.current;
        if (!canvas || !ctx || !video) return;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const now = performance.now();
            const dt = Math.min((now - lastTimeRef.current) / (1000 / 60), 3); // Normalize to 60fps, cap at 3
            lastTimeRef.current = now;

            let results: any = null;
            if (isHardModeRef.current && faceLandmarkerRef.current) {
                results = faceLandmarkerRef.current.detectForVideo(video, now);
            } else if (handLandmarkerRef.current) {
                results = handLandmarkerRef.current.detectForVideo(video, now);
            }

            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-width, 0);
            ctx.drawImage(video, 0, 0, width, height);
            ctx.restore();

            updateGame(results, width, height, dt);
            drawGame(ctx, width, height, results);

            requestAnimationFrame(render);
        };
        render();
    };

    useEffect(() => {
        if (holeRef.current) {
            const dir = holeRef.current.vx >= 0 ? 1 : -1;
            holeRef.current.vx = holeSpeed * dir;
        }
    }, [holeSpeed]);

    const updateGame = (results: any, width: number, height: number, dt: number) => {
        const hole = holeRef.current;
        if (!hole || !results) return;

        hole.x += hole.vx * dt;
        if (hole.x > width - SIDE_MARGIN - 60 || hole.x < SIDE_MARGIN + 60) hole.vx *= -1;

        const isHard = isHardModeRef.current;

        // Update flies
        fliesRef.current.forEach(fly => {
            fly.x += fly.vx * dt;
            fly.y += fly.vy * dt;
            if (fly.x < 0 || fly.x > width) fly.vx *= -1;
            if (fly.y < 0 || fly.y > height) fly.vy *= -1;
            if (Math.random() > 0.95) {
                fly.vx += (Math.random() - 0.5) * 0.5;
                fly.vy += (Math.random() - 0.5) * 0.5;
            }
        });

        // Wind/Air effect logic
        const now = performance.now();
        const cycle = 10000; 
        const isBlowing = (now % cycle) < 2500;

        if (isBlowing && windParticlesRef.current.length < 30) {
            windParticlesRef.current.push({
                x: -100,
                y: Math.random() * height,
                speed: 15 + Math.random() * 10,
                length: 100 + Math.random() * 150
            });
        }

        windParticlesRef.current.forEach((p, idx) => {
            p.x += p.speed * dt;
            if (p.x > width + p.length) windParticlesRef.current.splice(idx, 1);
        });

        if (isHard && results.faceLandmarks && results.faceLandmarks[0]) {
            const landmarks = results.faceLandmarks[0];
            const nose = landmarks[1]; // Nose Tip center
            const nxRaw = (1 - nose.x) * width;
            const nyRaw = nose.y * height;
            
            // Lerp smoothing (0.4 factor)
            const prev = noseRef.current || { x: nxRaw, y: nyRaw, vx: 0, vy: 0 };
            const nx = prev.x + (nxRaw - prev.x) * 0.4;
            const ny = prev.y + (nyRaw - prev.y) * 0.4;

            const dx = nx - prev.x;
            const dy = ny - prev.y;
            noseRef.current = { x: nx, y: ny, vx: dx, vy: dy };

            ballsRef.current.forEach(ball => {
                const dist = Math.hypot(ball.x - nx, ball.y - ny);
                if (dist < ball.radius + 20 && Math.hypot(dx, dy) > 1) {
                    ball.vx = dx * 2.2;
                    ball.vy = dy * 2.2;
                }
            });
        } else {
            // Hand detection (Standard Mode)
            const handLandmarks = results.landmarks || results.handLandmarks;
            if (!isHard && handLandmarks && handLandmarks[0]) {
                const landmarks = handLandmarks[0];
                FINGER_INDEXES.forEach(idx => {
                    const landmark = landmarks[idx];
                    if (!landmark) return;
                    
                    const fxRaw = (1 - landmark.x) * width;
                    const fyRaw = landmark.y * height;
                    
                    const prev = fingersRef.current[idx] || { x: fxRaw, y: fyRaw, vx: 0, vy: 0 };
                    const fx = prev.x + (fxRaw - prev.x) * 0.4;
                    const fy = prev.y + (fyRaw - prev.y) * 0.4;
                    
                    const dx = fx - prev.x;
                    const dy = fy - prev.y;
                    fingersRef.current[idx] = { x: fx, y: fy, vx: dx, vy: dy };

                    ballsRef.current.forEach(ball => {
                        const dist = Math.hypot(ball.x - fx, ball.y - fy);
                        if (dist < ball.radius + 20 && Math.hypot(dx, dy) > 1.5) {
                            ball.vx = dx * 1.8;
                            ball.vy = dy * 1.8;
                        }
                    });
                });
            }
        }

        ballsRef.current.forEach(ball => {
            ball.vx *= Math.pow(0.985, dt);
            ball.vy *= Math.pow(0.985, dt);
            ball.x += ball.vx * dt;
            ball.y += ball.vy * dt;

            // Store trails for smoothness
            const trail = ballTrailsRef.current[ball.id] || [];
            trail.push({ x: ball.x, y: ball.y });
            if (trail.length > 5) trail.shift();
            ballTrailsRef.current[ball.id] = trail;

            if (ball.x < ball.radius + SIDE_MARGIN) { ball.x = ball.radius + SIDE_MARGIN; ball.vx *= -0.7; }
            if (ball.x > width - ball.radius - SIDE_MARGIN) { ball.x = width - ball.radius - SIDE_MARGIN; ball.vx *= -0.7; }
            if (ball.y > height - ball.radius - BOTTOM_WALL) { ball.y = height - ball.radius - BOTTOM_WALL; ball.vy *= -0.7; }

            const dist = Math.hypot(ball.x - hole.x, ball.y - hole.y);
            if (dist < hole.radius) {
                const newScore = score + 1;
                if (newScore >= 12) {
                    setScore(0);
                    setHoleSpeed(0);
                    setEffect('win');
                    resetPositions();
                } else {
                    setScore(newScore);
                    setHoleSpeed(s => s + 2);
                    setEffect('win');
                    resetBall(ball, width, height);
                }
                if (winAudioRef.current) { winAudioRef.current.currentTime = 0; winAudioRef.current.play().catch(() => { }); }
            } else if (ball.y < -20) {
                if (missAudioRef.current) { missAudioRef.current.currentTime = 0; missAudioRef.current.play().catch(() => { }); }
                // Speed no longer decreases on miss
                setEffect('loss');
                resetBall(ball, width, height);
            }
        });
    };

    const resetPositions = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const width = canvas.width;

        if (holeRef.current) {
            holeRef.current.x = width / 2;
            holeRef.current.vx = 0;
        }

        ballsRef.current.forEach(ball => {
            ball.x = width / 2;
            ball.vx = 0;
            ball.vy = 0;
        });
    };

    const resetBall = (ball: Ball, width: number, height: number) => {
        ball.x = width / 2; ball.y = height / 2;
        ball.vx = 0; ball.vy = 0;
    };

    const drawGame = (ctx: CanvasRenderingContext2D, width: number, height: number, results: any) => {
        if (!results) return;
        const drawGrassBoundary = (x: number, y: number, w: number, h: number, orientation: 'left' | 'right' | 'bottom') => {
            // Use fixed colors instead of recreating gradients every frame for performance
            ctx.fillStyle = '#064e3b';
            ctx.fillRect(x, y, w, h);

            // Add a subtle inner darker area with a second fill for depth (faster than gradients)
            ctx.fillStyle = '#14532d';
            if (orientation === 'bottom') ctx.fillRect(x, y + h / 2, w, h / 2);
            else if (orientation === 'left') ctx.fillRect(x, y, w / 2, h);
            else if (orientation === 'right') ctx.fillRect(x + w / 2, y, w / 2, h);

            ctx.beginPath();
            ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
            const bladeSize = 8;
            if (orientation === 'left') {
                grassEdgesRef.current.left.forEach((offset, i) => {
                    const py = i * bladeSize;
                    ctx.lineTo(x + w, py);
                    ctx.lineTo(x + w + offset, py + bladeSize / 2);
                });
                ctx.lineTo(x + w, h); ctx.lineTo(x, h); ctx.lineTo(x, 0);
            } else if (orientation === 'right') {
                grassEdgesRef.current.right.forEach((offset, i) => {
                    const py = i * bladeSize;
                    ctx.lineTo(x, py);
                    ctx.lineTo(x - offset, py + bladeSize / 2);
                });
                ctx.lineTo(x, h); ctx.lineTo(x + w, h); ctx.lineTo(x + w, 0);
            } else if (orientation === 'bottom') {
                grassEdgesRef.current.bottom.forEach((offset, i) => {
                    const px = i * bladeSize;
                    ctx.lineTo(px, y);
                    ctx.lineTo(px + bladeSize / 2, y - offset);
                });
                ctx.lineTo(w, y); ctx.lineTo(w, y + h); ctx.lineTo(0, y + h);
            }
            ctx.fill();
        };

        const drawFlag = (x: number, y: number) => {
            ctx.beginPath();
            ctx.strokeStyle = '#666'; ctx.lineWidth = 3;
            ctx.moveTo(x, y); ctx.lineTo(x, y - 60);
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = '#ef4444'; // Red Flag
            ctx.moveTo(x, y - 60);
            ctx.lineTo(x + 25, y - 45);
            ctx.lineTo(x, y - 30);
            ctx.fill();
        };

        // Draw Grass Walls
        drawGrassBoundary(0, 0, SIDE_MARGIN, height, 'left');
        drawGrassBoundary(width - SIDE_MARGIN, 0, SIDE_MARGIN, height, 'right');
        drawGrassBoundary(0, height - BOTTOM_WALL, width, BOTTOM_WALL, 'bottom');

        // Draw Flags on grass
        drawFlag(SIDE_MARGIN / 2, height - BOTTOM_WALL + 40);
        drawFlag(width - SIDE_MARGIN / 2, height - BOTTOM_WALL + 40);

        // Draw Golden Flies (Jugnu)
        fliesRef.current.forEach(fly => {
            const overLeft = fly.x < SIDE_MARGIN;
            const overRight = fly.x > width - SIDE_MARGIN;
            const overBottom = fly.y > height - BOTTOM_WALL;

            if (overLeft || overRight || overBottom) {
                // Efficient Fake Glow
                ctx.beginPath();
                ctx.arc(fly.x, fly.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'; // Faint outer glow
                ctx.fill();

                ctx.beginPath();
                ctx.arc(fly.x, fly.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#FFD700'; // Bright inner core
                ctx.fill();
            }
        });

        // Draw Wind
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        windParticlesRef.current.forEach(p => {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.length, p.y);
        });
        ctx.stroke();

        const hole = holeRef.current;
        if (hole) {
            ctx.beginPath(); ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#000000'; ctx.fill();
            ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
        }
        ballsRef.current.forEach(ball => {
            // Draw Trails
            const trail = ballTrailsRef.current[ball.id] || [];
            trail.forEach((pos, i) => {
                const alpha = (i / trail.length) * 0.3;
                ctx.beginPath(); ctx.arc(pos.x, pos.y, ball.radius * (i / trail.length), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 105, 180, ${alpha})`; ctx.fill();
            });

            ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#FF69B4'; ctx.fill();
            ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)'; ctx.lineWidth = 4; ctx.stroke();
        });
        const isHard = isHardModeRef.current;
        const handLandmarks = results.landmarks || results.handLandmarks;

        if (isHard && results.faceLandmarks && results.faceLandmarks[0]) {
            const nose = results.faceLandmarks[0][1];
            const nx = (1 - nose.x) * width;
            const ny = nose.y * height;
            
            // Marker Trail
            markerTrailsRef.current.push({ x: nx, y: ny });
            if (markerTrailsRef.current.length > 3) markerTrailsRef.current.shift();
            markerTrailsRef.current.forEach((pos, i) => {
                ctx.beginPath(); ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 105, 180, ${(i / 3) * 0.2})`; ctx.fill();
            });

            ctx.beginPath(); ctx.arc(nx, ny, 15, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 105, 180, 0.3)'; ctx.fill(); 
            
            ctx.beginPath(); ctx.arc(nx, ny, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#FF69B4'; ctx.fill(); 
        } else if (!isHard && handLandmarks && handLandmarks[0]) {
            const landmarks = handLandmarks[0];
            FINGER_INDEXES.forEach(idx => {
                const tip = landmarks[idx];
                if (!tip) return;
                const fx = (1 - tip.x) * width;
                const fy = tip.y * height;

                ctx.beginPath(); ctx.arc(fx, fy, 10, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 105, 180, 0.2)'; ctx.fill(); 

                ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#FF69B4'; ctx.fill(); 
            });
        }
    };

    return (
        <div className="w-full h-full bg-black flex items-center justify-center relative">
            <video ref={videoRef} className="hidden" autoPlay playsInline />
            <canvas ref={canvasRef} className="w-full h-full object-cover pointer-events-none" width={1280} height={720} />

            {!isStarted && (
                <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-3xl flex items-center justify-center">
                    <button onClick={initializeGame} className="flex flex-col items-center gap-6 group transition-all active:scale-95">
                        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.3)] animate-pulse">
                            <svg className="w-14 h-14 text-black fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                        <span className="text-white text-sm font-black uppercase tracking-[1em] opacity-80 group-hover:opacity-100 italic transition-opacity">LET&apos;S GOLF!</span>
                    </button>
                </div>
            )}

            <div className="absolute bottom-12 right-12 flex flex-col items-end gap-4 z-40">
                <button 
                    onClick={() => {
                        const next = !isHardMode;
                        setIsHardMode(next);
                        isHardModeRef.current = next;
                    }}
                    className="group bg-black/60 hover:bg-black/80 backdrop-blur-3xl text-white border border-white/20 px-8 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-2xl flex items-center gap-4 border-l-4 border-l-purple-500"
                >
                    <div className="flex flex-col items-end text-right">
                        <span className="opacity-40 text-[8px] tracking-[0.3em]">Style Switcher</span>
                        <span className="group-hover:text-purple-400 transition-colors uppercase">
                            {isHardMode ? 'Standard Style ☝️' : 'Nose Style 😈'}
                        </span>
                    </div>
                </button>
            </div>

            <div className="absolute bottom-12 left-12 flex flex-col items-start gap-4 z-40">
                <button
                    onClick={resetPositions}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-3xl text-white border border-white/10 px-8 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-2xl group flex flex-col items-start gap-1"
                >
                    <span className="opacity-40 text-[8px] tracking-[0.2em] mb-1">Fail-Safe</span>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Reset Level
                    </div>
                </button>
            </div>

            <div className="absolute top-12 right-12 flex flex-col items-end gap-5 pointer-events-none z-40">
                <div className="bg-black/60 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-[2rem] shadow-2xl flex flex-col items-end gap-2 border-r-4 border-r-white/20">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Score</span>
                        <span className="text-3xl font-black text-white italic">{score}</span>
                    </div>
                    <div className="w-8 h-[1px] bg-white/10" />
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-green-500/50 mb-1">Level</span>
                        <span className="text-xl font-black text-white italic opacity-70">{score}<span className="text-[10px] text-white/20 ml-0.5">/12</span></span>
                    </div>
                </div>
            </div>

            {effect && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-lg pointer-events-none">
                    <div className="flex flex-col items-center gap-8 animate-in zoom-in slide-in-from-bottom-20 duration-500">
                        <div className="text-[16rem] sm:text-[22rem] drop-shadow-[0_0_100px_rgba(255,255,255,0.3)]">
                            {effect === 'win' ? "🔥" : "🤫"}
                        </div>
                        <div className="text-white text-5xl font-black uppercase tracking-[1.5rem] italic drop-shadow-2xl">
                            {effect === 'win' ? "LESSGO!" : "NOOB!!"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
