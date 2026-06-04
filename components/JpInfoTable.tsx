"use client";

import { memo, type CSSProperties, type ReactNode } from "react";

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
  compact?: boolean;
  className?: string;
};

const DEFAULT_SECTION_COLOR = "#f3c9b8";
const DEFAULT_LABEL_COLOR = "#fde7dd";
const LABEL_WIDTH = "95px";
const CHIC_LABEL_WIDTH = "82px";
const JP_EXPORT_FONT_FAMILY =
  '"Noto Sans JP", "Yu Gothic", "Hiragino Kaku Gothic ProN", Meiryo, Arial, sans-serif';
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
  compact = false,
  className,
}: CellTextProps) {
  const displayValue = value || "-";
  const fontSize = estimateFontSize(displayValue, maxFontSize, minFontSize, capacity);
  const lineHeight = compact ? 1.15 : 1.2;

  return (
    <span
      className={cx("block max-w-full overflow-hidden whitespace-nowrap", className)}
     style={{
        fontFamily: JP_EXPORT_FONT_FAMILY,
        fontSize,
        lineHeight,
        minHeight: `${Math.ceil(fontSize * lineHeight)}px`,
        textOverflow: "clip",
      }}
    >
      {displayValue}
    </span>
  );
});

export function SectionTitle({ children, bgColor = DEFAULT_SECTION_COLOR }: { children: ReactNode; bgColor?: string }) {
  return (
    <div
      className="flex min-h-[18px] items-center border border-black px-2 py-0 text-[11px] font-bold leading-[1.35]"
      style={{ backgroundColor: bgColor, fontFamily: JP_EXPORT_FONT_FAMILY }}
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
  const valueColumnWidth = autoValueWidth
    ? "1fr"
    : `calc((100% - ${labelWidth} - ${labelWidth}) / 2)`;
  const rowHeight = compactForChic || compact ? 22 : 24;
  const cellPaddingClass = compactForChic ? "px-1.5" : "px-2";
  const tableTextClass = compactForChic ? "text-[10px]" : "text-[11px]";
  const cellMaxFontSize = compactForChic ? 10 : 11;
  const labelCapacity = compactForChic ? 7.8 : 8.8;
  const halfValueCapacity = compactForChic ? 8.5 : 10.5;
  const fullValueCapacity = compactForChic ? 28 : 34;
  const gridTemplateColumns = `${labelWidth} ${valueColumnWidth} ${labelWidth} ${valueColumnWidth}`;
  const cellClass = cx(
    "box-border flex min-w-0 items-center overflow-hidden border-r border-b border-black py-0",
    cellPaddingClass
  );
  const labelCellClass = cx(cellClass, "font-bold");
  const isCompact = compactForChic || compact;

  function renderCell(
    key: string,
    value: string | undefined,
    capacity: number,
    options: { label?: boolean; gridColumn?: string } = {}
  ) {
    const style: CSSProperties = {
      minHeight: rowHeight,
      ...(options.label ? { backgroundColor: labelBgColor } : undefined),
      ...(options.gridColumn ? { gridColumn: options.gridColumn } : undefined),
    };

    return (
      <div key={key} className={options.label ? labelCellClass : cellClass} style={style}>
        <CellText
          value={value}
          maxFontSize={cellMaxFontSize}
          capacity={capacity}
          compact={isCompact}
          className={options.label ? "font-bold" : undefined}
        />
      </div>
    );
  }


  return (
    <div
      className={cx("w-full border-l border-black", tableTextClass)}
      style={{ fontFamily: JP_EXPORT_FONT_FAMILY }}
    >
      {rows.map((row, index) => {
        if (row.label2) {
          return (
            <div
              key={`${row.label}-${index}`}
              className="grid w-full"
              style={{ gridTemplateColumns, minHeight: rowHeight }}
            >
              {renderCell(`${row.label}-${index}-label`, row.label, labelCapacity, { label: true })}
              {renderCell(`${row.label}-${index}-value`, row.value, halfValueCapacity)}
              {renderCell(`${row.label}-${index}-label2`, row.label2, labelCapacity, { label: true })}
              {renderCell(`${row.label}-${index}-value2`, row.value2, halfValueCapacity)}
            </div>
          );
        }

        return (
          <div
            key={`${row.label}-${index}`}
            className="grid w-full"
            style={{ gridTemplateColumns, minHeight: rowHeight }}
          >
            {renderCell(`${row.label}-${index}-label`, row.label, labelCapacity, { label: true })}
            {renderCell(`${row.label}-${index}-value`, row.value, fullValueCapacity, { gridColumn: "2 / 5" })}
          </div>
        );
      })}
    </div>
  );
});
