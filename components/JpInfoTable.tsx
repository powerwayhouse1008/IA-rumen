type Row = {
  label: string;
  value: string;
  label2?: string;
  value2?: string;
};

export function SectionTitle({ children, bgColor = "#f3c9b8" }: { children: React.ReactNode; bgColor?: string }) {
  return (
    <div className="px-2 py-[3px] text-[11px] font-bold border border-black" style={{ backgroundColor: bgColor }}>
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
  const labelWidth = "111px"; // 92px + ~0.5cm
  const singleColumnTemplate = autoValueWidth ? `${labelWidth} minmax(0, 1fr)` : `${labelWidth} 1fr`;
  const doubleColumnTemplate = autoValueWidth
    ? `${labelWidth} minmax(0, 1fr) ${labelWidth} minmax(0, 1fr)`
    : `${labelWidth} 1fr ${labelWidth} 1fr`;;
  const valueCellClass = "px-2 py-[3px] whitespace-nowrap border-r border-black overflow-hidden text-ellipsis";
  const lastValueCellClass = "px-2 py-[3px] whitespace-nowrap overflow-hidden text-ellipsis";
  return (
    <div className="border border-black border-t-0 text-[11px]">
      {rows.map((r, i) => {
        if (r.label2) {
          return (
              <div key={i} className="grid border-b border-black last:border-b-0" style={{ gridTemplateColumns: doubleColumnTemplate }}>
              <div className="px-2 py-[3px] font-bold border-r border-black whitespace-nowrap" style={{ backgroundColor: labelBgColor }}>
                {r.label}
              </div>
              <div className={valueCellClass}>{r.value}</div>
              <div className="px-2 py-[3px] font-bold border-r border-black whitespace-nowrap" style={{ backgroundColor: labelBgColor }}>
                {r.label2}
              </div>
             <div className={lastValueCellClass}>{r.value2 ?? "-"}</div>
            </div>
          );
        }

        return (
         <div key={i} className="grid border-b border-black last:border-b-0" style={{ gridTemplateColumns: singleColumnTemplate }}>
            <div className="px-2 py-[3px] font-bold border-r border-black whitespace-nowrap" style={{ backgroundColor: labelBgColor }}>
              {r.label}
            </div>
            <div className={lastValueCellClass}>{r.value}</div>
          </div>
          );
      })}
    </div>
  );
}
