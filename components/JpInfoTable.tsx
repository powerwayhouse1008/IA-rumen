type Row = {
  label: string;
  value: string;
  label2?: string;
  value2?: string;
};

export function SectionTitle({ children, bgColor = "#f3c9b8" }: { children: React.ReactNode; bgColor?: string }) {
  return (
    <div className="px-2 py-1 text-[11px] font-bold border border-black" style={{ backgroundColor: bgColor }}>
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
  const singleColumnGrid = autoValueWidth
    ? `grid-cols-[${labelWidth}_minmax(0,1fr)]`
    : `grid-cols-[${labelWidth}_1fr]`;
  const doubleColumnGrid = autoValueWidth
     ? `grid-cols-[${labelWidth}_minmax(0,1fr)_${labelWidth}_minmax(0,1fr)]`
    : `grid-cols-[${labelWidth}_1fr_${labelWidth}_1fr]`;
  const valueCellClass = autoValueWidth
    ? "px-2 py-1 whitespace-nowrap border-r border-black"
    : "px-2 py-1 whitespace-pre-wrap border-r border-black";
  const lastValueCellClass = autoValueWidth ? "px-2 py-1 whitespace-nowrap" : "px-2 py-1 whitespace-pre-wrap";

  return (
    <div className="border border-black border-t-0 text-[11px]">
      {rows.map((r, i) => {
        if (r.label2) {
          return (
              <div key={i} className={`grid border-b border-black last:border-b-0 ${doubleColumnGrid}`}>
              <div className="px-2 py-1 font-bold border-r border-black" style={{ backgroundColor: labelBgColor }}>
                {r.label}
              </div>
              <div className={valueCellClass}>{r.value}</div>
              <div className="px-2 py-1 font-bold border-r border-black" style={{ backgroundColor: labelBgColor }}>
                {r.label2}
              </div>
             <div className={lastValueCellClass}>{r.value2 ?? "-"}</div>
            </div>
          );
        }

        return (
          <div key={i} className={`grid border-b border-black last:border-b-0 ${singleColumnGrid}`}>
            <div className="px-2 py-1 font-bold border-r border-black" style={{ backgroundColor: labelBgColor }}>
              {r.label}
            </div>
            <div className={lastValueCellClass}>{r.value}</div>
          </div>
          );
      })}
    </div>
  );
}
