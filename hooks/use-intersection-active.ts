"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

type RegisterRef = (id: string) => (node: HTMLElement | null) => void;

export function useIntersectionActive(ids: string[], enabled: boolean, threshold = 0.6) {
  const [activeId, setActiveId] = useState<string>(ids[0] || '');
  const nodesRef = useRef(new Map<string, HTMLElement>());

  const registerRef: RegisterRef = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      if (node) {
        nodesRef.current.set(id, node);
      } else {
        nodesRef.current.delete(id);
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled || ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        threshold: [0.35, 0.5, threshold, 0.8],
        rootMargin: '-5% 0px -10% 0px'
      }
    );

    ids.forEach((id) => {
      const node = nodesRef.current.get(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [ids, enabled, threshold]);

  return { activeId, registerRef, setActiveId };
}
