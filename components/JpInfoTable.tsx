"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Row = {
  label: string;
  value: string;
  label2?: string;
  value2?: string;
};
function AutoShrinkCellText({ value }: { value: string }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(11);

  useLayoutEffect(() => {
    const textEl = textRef.current;
    if (!textEl) return;

    const parentEl = textEl.parentElement;
    if (!parentEl) return;

    const maxFontSize = 11;
    const minFontSize = 7;

    const fitText = () => {
      let nextFontSize = maxFontSize;
      textEl.style.fontSize = `${nextFontSize}px`;

      while (textEl.scrollWidth > parentEl.clientWidth && nextFontSize > minFontSize) {
        nextFontSize -= 0.5;
        textEl.style.fontSize = `${nextFontSize}px`;
      }

      setFontSize(nextFontSize);
    };

    fitText();

    const observer = new ResizeObserver(() => {
      fitText();
    });

    observer.observe(parentEl);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span
      ref={textRef}
      className="block whitespace-nowrap leading-tight"
      style={{ fontSize: `${fontSize}px` }}
    >
      {value}
    </span>
  );
}

export function SectionTitle({ children, bgColor = "#f3c9b8" }: { children: React.ReactNode; bgColor?: string }) {
  return (
      <div className="border border-black px-2 py-0 text-[11px] font-bold" style={{ backgroundColor: bgColor }}>
      {children}
    </div>
  );
}

export function InfoTable({
  rows,
  labelBgColor = "#fde7dd",
  autoValueWidth = false,
}: {
  rows: Row[];
  labelBgColor?: string;
  autoValueWidth?: boolean;
}) {
  const labelWidth = "95px"; // keep sections full-width while making colored label cells slightly narrower
  const singleColumnTemplate = autoValueWidth ? `${labelWidth} minmax(0, 1fr)` : `${labelWidth} 1fr`;
  const doubleColumnTemplate = autoValueWidth
    ? `${labelWidth} minmax(0, 1fr) ${labelWidth} minmax(0, 1fr)`
    : `${labelWidth} 1fr ${labelWidth} 1fr`;
  const valueCellClass = "min-w-0 border-r border-black px-2 py-0 overflow-hidden";
  const lastValueCellClass = "min-w-0 px-2 py-0 overflow-hidden";

  return (
   <div className="w-full border border-black border-t-0 text-[11px]">
      {rows.map((r, i) => {
        if (r.label2) {
          return (
            <div
              key={i}
              className="grid w-full border-b border-black last:border-b-0"
              style={{ gridTemplateColumns: doubleColumnTemplate }}
            >
              <div
                className="whitespace-nowrap border-r border-black px-2 py-0 font-bold"
                style={{ backgroundColor: labelBgColor }}
              >
                {r.label}
              </div>
              <div className={valueCellClass}>
                <AutoShrinkCellText value={r.value} />
              </div>
              <div
                className="whitespace-nowrap border-r border-black px-2 py-0 font-bold"
                style={{ backgroundColor: labelBgColor }}
              >
                {r.label2}
              </div>
             <div className={lastValueCellClass}>
                <AutoShrinkCellText value={r.value2 ?? "-"} />
              </div>
            </div>
          );
        }

        return (
         <div
            key={i}
            className="grid w-full border-b border-black last:border-b-0"
            style={{ gridTemplateColumns: singleColumnTemplate }}
          >
            <div
              className="whitespace-nowrap border-r border-black px-2 py-0 font-bold"
              style={{ backgroundColor: labelBgColor }}
            >
              {r.label}
            </div>
           <div className={lastValueCellClass}>
              <AutoShrinkCellText value={r.value} />
            </div>
          </div>
       );
      })}
    </div>
  );
}
