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
  value: string;
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
  minFontSize = 5,
  capacity,
  className,
}: CellTextProps) {
  const fontSize = estimateFontSize(value, maxFontSize, minFontSize, capacity);

  return (
    <span
      className={cx("block max-w-full overflow-hidden whitespace-nowrap leading-none", className)}
      style={{ fontSize, lineHeight: 1, textOverflow: "clip" }}
    >
      {value || "-"}
    </span>
  );
});

export function SectionTitle({ children, bgColor = DEFAULT_SECTION_COLOR }: { children: ReactNode; bgColor?: string }) {
  return (
    <div className="border border-black px-2 py-0 text-[11px] font-bold" style={{ backgroundColor: bgColor }}>
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
  const rowHeight = compactForChic || compact ? "20px" : "22px";
  const cellPaddingX = compactForChic ? "6px" : "8px";
  const tableTextClass = compactForChic ? "text-[10px]" : "text-[11px]";
  const cellMaxFontSize = compactForChic ? 10 : 11;
  const valueColumnWidth = `calc((100% - ${labelWidth} - ${labelWidth}) / 2)`;
  const labelCapacity = compactForChic ? 7.8 : 8.8;
  const halfValueCapacity = compactForChic ? 8.5 : 10.5;
  const fullValueCapacity = compactForChic ? 28 : 34;

  const cellStyle: CSSProperties = {
    boxSizing: "border-box",
    height: rowHeight,
    minWidth: 0,
    overflow: "hidden",
    padding: `0 ${cellPaddingX}`,
    verticalAlign: "middle",
  };

  const labelCellStyle: CSSProperties = {
    ...cellStyle,
    backgroundColor: labelBgColor,
  };

  return (
    <table
      className={cx("w-full border border-black border-t-0", tableTextClass)}
      style={{ borderCollapse: "collapse", tableLayout: "fixed" }}
    >
      <colgroup>
        <col style={{ width: labelWidth }} />
        <col style={{ width: valueColumnWidth }} />
        <col style={{ width: labelWidth }} />
        <col style={{ width: valueColumnWidth }} />
      </colgroup>
      <tbody>
        {rows.map((row, index) => {
          const topBorderClass = index === 0 ? "border-t-0" : undefined;

          if (row.label2) {
            return (
              <tr key={`${row.label}-${index}`}>
                <td className={cx("border border-black", topBorderClass)} style={labelCellStyle}>
                  <CellText value={row.label} maxFontSize={cellMaxFontSize} capacity={labelCapacity} className="font-bold" />
                </td>
                <td className={cx("border border-black", topBorderClass)} style={cellStyle}>
                  <CellText value={row.value} maxFontSize={cellMaxFontSize} capacity={halfValueCapacity} />
                </td>
                <td className={cx("border border-black", topBorderClass)} style={labelCellStyle}>
                  <CellText value={row.label2} maxFontSize={cellMaxFontSize} capacity={labelCapacity} className="font-bold" />
                </td>
                <td className={cx("border border-black", topBorderClass)} style={cellStyle}>
                  <CellText value={row.value2 ?? "-"} maxFontSize={cellMaxFontSize} capacity={halfValueCapacity} />
                </td>
              </tr>
            );
          }

          return (
            <tr key={`${row.label}-${index}`}>
              <td className={cx("border border-black", topBorderClass)} style={labelCellStyle}>
                <CellText value={row.label} maxFontSize={cellMaxFontSize} capacity={labelCapacity} className="font-bold" />
              </td>
              <td className={cx("border border-black", topBorderClass)} colSpan={3} style={cellStyle}>
                <CellText value={row.value} maxFontSize={cellMaxFontSize} capacity={fullValueCapacity} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});
