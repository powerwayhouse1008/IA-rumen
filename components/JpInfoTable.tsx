"use client";

import { memo, type ReactNode } from "react";

type Row = {
  label: string;
  value: string;
  label2?: string;
  value2?: string;
};

type InfoTableProps = {
  rows: Row[];
  labelBgColor?: string;
  autoValueWidth?: boolean;
  compact?: boolean;
  compactForChic?: boolean;
};

type CellTextProps = {
  value?: string;
  maxFontSize: number;
  minFontSize?: number;
  capacity: number;
  className?: string;
};

const DEFAULT_SECTION_COLOR = "#f3c9b8";
const DEFAULT_LABEL_COLOR = "#fde7dd";
const LABEL_WIDTH = "95px";
const CHIC_LABEL_WIDTH = "82px";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getVisualLength(value: string) {
  return Array.from(value || "-").reduce((total, char) => {
    if (/\s/.test(char)) return total + 0.35;
    if (/^[\x00-\x7F]$/.test(char)) return total + 0.55;
    return total + 1;
  }, 0);
}

function estimateFontSize(value: string, maxFontSize: number, minFontSize: number, capacity: number) {
  const visualLength = getVisualLength(value);
  if (visualLength <= capacity) return maxFontSize;

  const nextFontSize = Math.floor((maxFontSize * capacity * 10) / visualLength) / 10;
  return Math.max(minFontSize, Math.min(maxFontSize, nextFontSize));
}

const CellText = memo(function CellText({
  value,
  maxFontSize,
  minFontSize = 6,
  capacity,
  className,
}: CellTextProps) {
  const displayValue = value || "-";
  const fontSize = estimateFontSize(displayValue, maxFontSize, minFontSize, capacity);

  return (
    <span
      className={cx("block max-w-full overflow-hidden whitespace-nowrap", className)}
      style={{ fontSize, lineHeight: 1.35, textOverflow: "clip" }}
    >
      {displayValue}
    </span>
  );
});

export function SectionTitle({ children, bgColor = DEFAULT_SECTION_COLOR }: { children: ReactNode; bgColor?: string }) {
  return (
    <div
      className="flex min-h-[18px] items-center border border-black px-2 py-0 text-[11px] font-bold leading-[1.35]"
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </div>
  );
}

export const InfoTable = memo(function InfoTable({
  rows,
  labelBgColor = DEFAULT_LABEL_COLOR,
  autoValueWidth = false,
  compact = false,
  compactForChic = false,
}: InfoTableProps) {
  const labelWidth = compactForChic ? CHIC_LABEL_WIDTH : LABEL_WIDTH;
  const valueWidth = autoValueWidth ? "minmax(0,1fr)" : "1fr";
  const gridTemplateColumns = `${labelWidth} ${valueWidth} ${labelWidth} ${valueWidth}`;
  const cellHeightClass = compactForChic || compact ? "h-[20px]" : "h-[22px]";
  const cellPaddingClass = compactForChic ? "px-1.5" : "px-2";
  const tableTextClass = compactForChic ? "text-[10px]" : "text-[11px]";
  const cellMaxFontSize = compactForChic ? 10 : 11;
  const labelCapacity = compactForChic ? 7.8 : 8.8;
  const halfValueCapacity = compactForChic ? 8.5 : 10.5;
  const fullValueCapacity = compactForChic ? 28 : 34;
  const baseCellClass = cx(
    "box-border flex min-w-0 items-center overflow-hidden border-r border-black py-0 leading-[1.35]",
    cellHeightClass,
    cellPaddingClass
  );
  const labelCellClass = cx(baseCellClass, "font-bold");
  const lastCellClass = baseCellClass.replace(" border-r border-black", "");

  return (
    <div className={cx("w-full border border-black border-t-0", tableTextClass)}>
      {rows.map((row, index) => {
        const isLastRow = index === rows.length - 1;
        const rowClassName = cx("grid w-full", !isLastRow && "border-b border-black");

        if (row.label2) {
          return (
            <div key={`${row.label}-${index}`} className={rowClassName} style={{ gridTemplateColumns }}>
              <div className={labelCellClass} style={{ backgroundColor: labelBgColor }}>
                <CellText value={row.label} maxFontSize={cellMaxFontSize} capacity={labelCapacity} className="font-bold" />
              </div>
              <div className={baseCellClass}>
                <CellText value={row.value} maxFontSize={cellMaxFontSize} capacity={halfValueCapacity} />
              </div>
              <div className={labelCellClass} style={{ backgroundColor: labelBgColor }}>
                <CellText value={row.label2} maxFontSize={cellMaxFontSize} capacity={labelCapacity} className="font-bold" />
              </div>
              <div className={lastCellClass}>
                <CellText value={row.value2} maxFontSize={cellMaxFontSize} capacity={halfValueCapacity} />
              </div>
            </div>
          );
        }

        return (
          <div key={`${row.label}-${index}`} className={rowClassName} style={{ gridTemplateColumns }}>
            <div className={labelCellClass} style={{ backgroundColor: labelBgColor }}>
              <CellText value={row.label} maxFontSize={cellMaxFontSize} capacity={labelCapacity} className="font-bold" />
            </div>
            <div className={lastCellClass} style={{ gridColumn: "span 3" }}>
              <CellText value={row.value} maxFontSize={cellMaxFontSize} capacity={fullValueCapacity} />
            </div>
          </div>
        );
      })}
    </div>
  );
});
