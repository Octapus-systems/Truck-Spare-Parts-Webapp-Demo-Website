"use client";

import { useEffect, useRef, useState } from "react";
import { Overlay } from "./overlay";

type Detector = { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
type DetectorCtor = new (options?: { formats?: string[] }) => Detector;

const FORMATS = ["code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e", "qr_code", "data_matrix", "itf"];

/** Reads a barcode with the device camera (browser BarcodeDetector: Chrome, Edge, Android). */
export function CameraScan({ onCode, onClose }: { onCode: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const supported = typeof window !== "undefined" && "BarcodeDetector" in window;

  useEffect(() => {
    if (!supported) return;
    let stream: MediaStream | null = null;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const Ctor = (window as unknown as { BarcodeDetector: DetectorCtor }).BarcodeDetector;
    const detector = new Ctor({ formats: FORMATS });

    const tick = async () => {
      if (stopped || !videoRef.current) return;
      try {
        const [hit] = await detector.detect(videoRef.current);
        if (hit?.rawValue) {
          stopped = true;
          onCode(hit.rawValue.trim());
          return;
        }
      } catch {
        // Frame not ready yet; try again.
      }
      timer = setTimeout(tick, 250);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(async (s) => {
        stream = s;
        if (stopped || !videoRef.current) return;
        videoRef.current.srcObject = s;
        await videoRef.current.play();
        tick();
      })
      .catch(() => setError("Camera not available or permission denied."));

    return () => {
      stopped = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [supported, onCode]);

  return (
    <Overlay title="Scan barcode" onClose={onClose}>
      <div className="grid gap-2 p-3">
        {supported && !error ? (
          <div className="relative bg-black">
            <video ref={videoRef} muted playsInline className="aspect-video w-full object-cover" />
            <div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-red-500" aria-hidden="true" />
          </div>
        ) : (
          <p className="border border-[var(--c-line)] p-3">
            {error ?? "This browser can't read barcodes from the camera. Use Chrome or Edge, or a USB scanner — it types the code into search and presses Enter."}
          </p>
        )}
        <p className="muted text-[12px]">Point at the part label. A matching part number, SKU or OE number is added to the bill.</p>
      </div>
    </Overlay>
  );
}
