"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  label: string;
  initials: string;
  onInitialsChange: (value: string) => void;
  onSignatureChange: (dataUrl: string | null) => void;
}

/**
 * Адаптивный холст для рисования подписи (мышь + сенсор).
 * Отдаёт PNG data-URL через onSignatureChange (или null, если очищено).
 */
export function SignaturePad({ label, initials, onInitialsChange, onSignatureChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const hasDrawn = useRef(false);
  const [empty, setEmpty] = useState(true);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  // Подгоняем размер «бэкинг-стора» под CSS-размер и devicePixelRatio,
  // сохраняя уже нарисованное при ресайзе/повороте экрана.
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const ratio = window.devicePixelRatio || 1;
    const prev = hasDrawn.current ? canvas.toDataURL() : null;

    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";

    // Белый фон, чтобы экспортированное изображение не было прозрачным.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (prev) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = prev;
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => setupCanvas());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [setupCanvas]);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx || !last.current) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasDrawn.current) {
      hasDrawn.current = true;
      setEmpty(false);
    }
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      onSignatureChange(hasDrawn.current ? canvas.toDataURL("image/png") : null);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    hasDrawn.current = false;
    setEmpty(true);
    onSignatureChange(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
          type="button"
          onClick={clear}
          disabled={empty}
          className="text-xs text-gray-500 hover:text-red-600 disabled:opacity-40 disabled:hover:text-gray-500"
        >
          Очистить
        </button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-40 bg-white rounded-lg border border-gray-300 touch-none cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-300 select-none">
            Распишитесь здесь
          </span>
        )}
      </div>

      <input
        type="text"
        value={initials}
        onChange={(e) => onInitialsChange(e.target.value)}
        placeholder="Инициалы (например, И. И. Иванов)"
        className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
