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
  const singleColumnGrid = autoValueWidth ? "grid-cols-[92px_auto] w-fit" : "grid-cols-[92px_1fr]";
  const doubleColumnGrid = autoValueWidth ? "grid-cols-[92px_auto_92px_auto] w-fit" : "grid-cols-[92px_1fr_92px_1fr]";

  return (
   <div className={`border border-black border-t-0 text-[11px] ${autoValueWidth ? "w-fit" : ""}`}>
      {rows.map((r, i) => {
        if (r.label2) {
          return (
            <div key={i} className={`grid border-b border-black ${doubleColumnGrid}`}>
              <div className="px-2 py-1 font-bold border-r border-black" style={{ backgroundColor: labelBgColor }}>
                {r.label}
              </div>
              <div className="px-2 py-1 whitespace-pre-wrap border-r border-black">{r.value}</div>
              <div className="px-2 py-1 font-bold border-r border-black" style={{ backgroundColor: labelBgColor }}>
                {r.label2}
              </div>
              <div className="px-2 py-1 whitespace-pre-wrap">{r.value2 ?? "-"}</div>
            </div>
          );
        }

        return (
          <div key={i} className={`grid border-b border-black ${singleColumnGrid}`}>
            <div className="px-2 py-1 font-bold border-r border-black" style={{ backgroundColor: labelBgColor }}>
              {r.label}
            </div>
            <div className="px-2 py-1 whitespace-pre-wrap">{r.value}</div>
          </div>
          );
      })}
    </div>
  );
}
