
import { useRef, useState } from "react";
import type { MoveInput } from "./Player";

type Props = {
  onMove: (value: MoveInput) => void;
  onLook: (dx: number, dy: number) => void;
};

export default function MobileControls({ onMove, onLook }: Props) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickPointer = useRef<number | null>(null);
  const lookPointer = useRef<number | null>(null);
  const lastLook = useRef({ x: 0, y: 0 });

  const [knob, setKnob] = useState({ x: 0, y: 0 });

  function updateJoystick(event: React.PointerEvent<HTMLDivElement>) {
    if (!joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const radius = rect.width * 0.34;
    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > radius) {
      dx = (dx / distance) * radius;
      dy = (dy / distance) * radius;
    }

    setKnob({ x: dx, y: dy });

    onMove({
      x: dx / radius,
      y: dy / radius,
    });
  }

  function releaseJoystick() {
    joystickPointer.current = null;
    setKnob({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  }

  return (
    <div className="mobile-controls">
      {/* Area untuk menggerakkan kamera */}
      <div
        className="camera-look-zone"
        onPointerDown={(event) => {
          lookPointer.current = event.pointerId;
          lastLook.current = {
            x: event.clientX,
            y: event.clientY,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (lookPointer.current !== event.pointerId) return;

          const dx = event.clientX - lastLook.current.x;
          const dy = event.clientY - lastLook.current.y;

          lastLook.current = {
            x: event.clientX,
            y: event.clientY,
          };

          onLook(dx, dy);
        }}
        onPointerUp={() => {
          lookPointer.current = null;
        }}
        onPointerCancel={() => {
          lookPointer.current = null;
        }}
      />

      {/* Joystick kiri */}
      <div
        ref={joystickRef}
        className="joystick-base"
        onPointerDown={(event) => {
          joystickPointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          updateJoystick(event);
        }}
        onPointerMove={(event) => {
          if (joystickPointer.current === event.pointerId) {
            updateJoystick(event);
          }
        }}
        onPointerUp={releaseJoystick}
        onPointerCancel={releaseJoystick}
      >
        <div
          className="joystick-knob"
          style={{
            transform: `translate(${knob.x}px, ${knob.y}px)`,
          }}
        />
      </div>

      <div className="movement-label">GERAK</div>
      <div className="camera-label">GESER UNTUK PUTAR KAMERA</div>
    </div>
  );
}
