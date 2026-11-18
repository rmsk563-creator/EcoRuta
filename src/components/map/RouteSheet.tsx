import { ChevronUp } from 'lucide-react';
import { useRef, type PointerEvent, type ReactNode } from 'react';

export type RouteSheetState = 'compact' | 'medium' | 'expanded';

const orderedStates: RouteSheetState[] = ['expanded', 'medium', 'compact'];

export function resolveRouteSheetState(
  current: RouteSheetState,
  deltaY: number,
  velocityY: number,
): RouteSheetState {
  const currentIndex = orderedStates.indexOf(current);
  const projectedDelta = deltaY + velocityY * 160;
  if (projectedDelta < -42) return orderedStates[Math.max(0, currentIndex - 1)]!;
  if (projectedDelta > 42) return orderedStates[Math.min(orderedStates.length - 1, currentIndex + 1)]!;
  return current;
}

function translateY(transform: string) {
  if (!transform || transform === 'none') return 0;
  const matrix3d = transform.match(/^matrix3d\((.+)\)$/);
  if (matrix3d) return Number(matrix3d[1]?.split(',')[13]) || 0;
  const matrix = transform.match(/^matrix\((.+)\)$/);
  return matrix ? Number(matrix[1]?.split(',')[5]) || 0 : 0;
}

export function RouteSheet({
  state,
  onStateChange,
  title,
  detail,
  children,
}: {
  state: RouteSheetState;
  onStateChange: (state: RouteSheetState) => void;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  const sheet = useRef<HTMLElement>(null);
  const drag = useRef({ pointerId: -1, startY: 0, startTranslateY: 0, lastY: 0, lastTime: 0, velocityY: 0, moved: false });
  const ignoreClick = useRef(false);

  const finishDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    const element = sheet.current;
    const deltaY = event.clientY - drag.current.startY;
    const nextState = resolveRouteSheetState(state, deltaY, drag.current.velocityY);
    ignoreClick.current = drag.current.moved;
    drag.current.pointerId = -1;
    onStateChange(nextState);
    window.requestAnimationFrame(() => {
      element?.classList.remove('is-dragging');
      element?.style.removeProperty('transform');
    });
  };

  return (
    <aside ref={sheet} className={`route-panel route-sheet route-sheet--${state}`} aria-label="Planificador de ruta">
      <button
        className="route-sheet__handle"
        type="button"
        aria-expanded={state === 'expanded'}
        aria-controls="route-sheet-content"
        onClick={() => {
          if (ignoreClick.current) { ignoreClick.current = false; return; }
          onStateChange(state === 'compact' ? 'medium' : state === 'medium' ? 'expanded' : 'compact');
        }}
        onPointerDown={(event) => {
          const element = sheet.current;
          if (!element) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          const currentY = translateY(window.getComputedStyle(element).transform);
          element.classList.add('is-dragging');
          element.style.transform = `translateY(${currentY}px)`;
          drag.current = {
            pointerId: event.pointerId,
            startY: event.clientY,
            startTranslateY: currentY,
            lastY: event.clientY,
            lastTime: event.timeStamp,
            velocityY: 0,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          if (drag.current.pointerId !== event.pointerId || !sheet.current) return;
          const elapsed = Math.max(1, event.timeStamp - drag.current.lastTime);
          drag.current.velocityY = (event.clientY - drag.current.lastY) / elapsed;
          drag.current.lastY = event.clientY;
          drag.current.lastTime = event.timeStamp;
          const deltaY = event.clientY - drag.current.startY;
          if (Math.abs(deltaY) > 8) drag.current.moved = true;
          sheet.current.style.transform = `translateY(${Math.max(-56, drag.current.startTranslateY + deltaY)}px)`;
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <span className="route-sheet__grabber" aria-hidden="true" />
        <span className="route-sheet__summary"><strong>{title}</strong><small>{detail}</small></span>
        <ChevronUp className="route-sheet__chevron" aria-hidden="true" />
      </button>
      <div className="route-sheet__content" id="route-sheet-content">
        {children}
      </div>
    </aside>
  );
}
