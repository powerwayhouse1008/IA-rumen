"use client";

import { memo, type CSSProperties, type ReactNode } from "react";

type Row = {
  label: string;
  value: string;
  label2?: string;
  value2?: string;
  rowHeight?: number;
  multiline?: boolean;
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
  rowHeight: number;
  className?: string;
  multiline?: boolean;
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
  rowHeight,
  className,
  multiline = false,
}: CellTextProps) {
  const displayValue = value || "-";
  const fontSize = estimateFontSize(displayValue, maxFontSize, minFontSize, capacity);
  const textHeight = Math.max(rowHeight - 2, Math.ceil(fontSize * 1.25));

  if (multiline) {
    return (
      <span
        className={cx("block max-w-full overflow-hidden whitespace-pre-wrap break-words", className)}
        style={{
          fontFamily: JP_EXPORT_FONT_FAMILY,
          fontSize,
          height: `${Math.max(rowHeight - 2, 1)}px`,
          lineHeight: 1.25,
        }}
      >
        {displayValue}
      </span>
    );
  }

  return (
    <span
      className={cx("block max-w-full overflow-hidden whitespace-nowrap", className)}
      style={{
        fontFamily: JP_EXPORT_FONT_FAMILY,
        fontSize,
        height: `${textHeight}px`,
        lineHeight: `${textHeight}px`,
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
  compact = false,
  compactForChic = false,
}: InfoTableProps) {
  const labelWidth = compactForChic ? CHIC_LABEL_WIDTH : LABEL_WIDTH;
  const rowHeight = compactForChic || compact ? 18 : 20;
  const cellPaddingClass = compactForChic ? "px-1.5" : "px-2";
  const tableTextClass = compactForChic ? "text-[9px]" : "text-[10px]";
  const cellMaxFontSize = compactForChic ? 9 : 10;
  const labelCapacity = compactForChic ? 7.8 : 8.8;
  const halfValueCapacity = compactForChic ? 8.5 : 10.5;
  const fullValueCapacity = compactForChic ? 28 : 34;
  const cellClass = cx(
    "box-border flex min-w-0 items-center overflow-hidden border-r border-b border-black py-0",
    cellPaddingClass
  );
  const labelCellClass = cx(cellClass, "font-bold");
  const labelCellStyle: CSSProperties = {
    flex: `0 0 ${labelWidth}`,
    height: rowHeight,
    backgroundColor: labelBgColor,
  };
  const halfValueCellStyle: CSSProperties = { flex: "1 1 0", height: rowHeight };
  const fullValueCellStyle: CSSProperties = {
    flex: "1 1 0",
    height: rowHeight,
  };

  function renderCell(
    key: string,
    value: string | undefined,
    capacity: number,
    currentRowHeight: number,
    options: { label?: boolean; full?: boolean; multiline?: boolean } = {}
  ) {
    const cellStyle: CSSProperties = {
      ...(options.label ? labelCellStyle : options.full ? fullValueCellStyle : halfValueCellStyle),
      height: currentRowHeight,
    };
    return (
      <div
        key={key}
        className={options.label ? labelCellClass : cellClass}
        style={cellStyle}
      >
        <CellText
          value={value}
          maxFontSize={cellMaxFontSize}
          capacity={capacity}
          rowHeight={currentRowHeight}
          className={options.label ? "font-bold" : undefined}
          multiline={!options.label && options.multiline}
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
        const currentRowHeight = row.rowHeight ?? rowHeight;
        if (row.label2) {
          return (
            <div
              key={`${row.label}-${index}`}
              className="flex w-full"
              style={{ height: currentRowHeight }}
            >
              {renderCell(`${row.label}-${index}-label`, row.label, labelCapacity, currentRowHeight, { label: true })}
              {renderCell(`${row.label}-${index}-value`, row.value, halfValueCapacity, currentRowHeight, { multiline: row.multiline })}
              {renderCell(`${row.label}-${index}-label2`, row.label2, labelCapacity, currentRowHeight, { label: true })}
              {renderCell(`${row.label}-${index}-value2`, row.value2, halfValueCapacity, currentRowHeight, { multiline: row.multiline })}
            </div>
          );
        }

        return (
          <div
            key={`${row.label}-${index}`}
            className="flex w-full"
            style={{ height: currentRowHeight }}
          >
            {renderCell(`${row.label}-${index}-label`, row.label, labelCapacity, currentRowHeight, { label: true })}
            {renderCell(`${row.label}-${index}-value`, row.value, fullValueCapacity, currentRowHeight, { full: true, multiline: row.multiline })}
          </div>
        );
      })}
    </div>
  );
});
