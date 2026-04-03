"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Row = {
  label: string;
  value: string;
  label2?: string;
  value2?: string;
};
function AutoShrinkCellText({
  value,
  maxFontSize = 11,
  minFontSize = 6,
  className = "",
}: {
  value: string;
  maxFontSize?: number;
  minFontSize?: number;
  className?: string;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useLayoutEffect(() => {
    const textEl = textRef.current;
    if (!textEl) return;

    const parentEl = textEl.parentElement;
    if (!parentEl) return;

    const fitText = () => {
      let nextFontSize = maxFontSize;
      textEl.style.fontSize = `${nextFontSize}px`;

      while (
        (textEl.scrollWidth > parentEl.clientWidth || textEl.scrollHeight > parentEl.clientHeight) &&
        nextFontSize > minFontSize
      ) {
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
  }, [value, maxFontSize, minFontSize]);

  return (
    <span
      ref={textRef}
      className={`block whitespace-nowrap leading-tight ${className}`.trim()}
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
  compact = false,
  compactForChic = false,
}: {
  rows: Row[];
  labelBgColor?: string;
  autoValueWidth?: boolean;
  compact?: boolean;
  compactForChic?: boolean;
}) {
  const labelWidth = compactForChic ? "82px" : "95px"; // keep sections full-width while making colored label cells slightly narrower
  const singleColumnTemplate = autoValueWidth ? `${labelWidth} minmax(0, 1fr)` : `${labelWidth} 1fr`;
  const doubleColumnTemplate = autoValueWidth
    ? `${labelWidth} minmax(0, 1fr) ${labelWidth} minmax(0, 1fr)`
    : `${labelWidth} 1fr ${labelWidth} 1fr`;
  const baseCellClass = `flex ${compactForChic ? "h-[18px]" : compact ? "h-[20px]" : "h-[22px]"} min-w-0 items-center overflow-hidden ${
    compactForChic ? "px-1.5" : "px-2"
  } py-0`;
  const labelCellClass = `${baseCellClass} border-r border-black`;
  const valueCellClass = `${baseCellClass} border-r border-black`;
  const lastValueCellClass = baseCellClass;
  const tableTextClass = compactForChic ? "text-[10px]" : "text-[11px]";
  const cellMaxFontSize = compactForChic ? 10 : 11;


  return (
   <div className={`w-full border border-black border-t-0 ${tableTextClass}`}>
      {rows.map((r, i) => {
        if (r.label2) {
          return (
            <div
              key={i}
              className="grid w-full border-b border-black last:border-b-0"
              style={{ gridTemplateColumns: doubleColumnTemplate }}
            >
              <div
                 className={labelCellClass}
                style={{ backgroundColor: labelBgColor }}
              >
                <AutoShrinkCellText value={r.label} maxFontSize={cellMaxFontSize} className="font-bold" />
              </div>
              <div className={valueCellClass}>
                 <AutoShrinkCellText value={r.value} maxFontSize={cellMaxFontSize} />
              </div>
              <div
                className={labelCellClass}
                style={{ backgroundColor: labelBgColor }}
              >
                 <AutoShrinkCellText value={r.label2} maxFontSize={cellMaxFontSize} className="font-bold" />
              </div>
             <div className={lastValueCellClass}>
                <AutoShrinkCellText value={r.value2 ?? "-"} maxFontSize={cellMaxFontSize} />
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
              className={labelCellClass}
              style={{ backgroundColor: labelBgColor }}
            >
              <AutoShrinkCellText value={r.label} className="font-bold" />
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
