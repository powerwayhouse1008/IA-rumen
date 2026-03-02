type Row = { label: string; value: string };

export function SectionTitle({ children, bgColor = "#f3c9b8" }: { children: React.ReactNode; bgColor?: string }) {
  return (
    <div className="px-2 py-1 text-[11px] font-bold border border-black" style={{ backgroundColor: bgColor }}>
      {children}
    </div>
  );
}

export function InfoTable({ rows, labelBgColor = "#fde7dd" }: { rows: Row[]; labelBgColor?: string }) {
  return (
    <div className="border border-black border-t-0 text-[11px]">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[92px_1fr] border-b border-black">
         <div className="px-2 py-1 font-bold border-r border-black" style={{ backgroundColor: labelBgColor }}>
            {r.label}
          </div>
          <div className="px-2 py-1 whitespace-pre-wrap">{r.value}</div>
        </div>
      ))}
    </div>
  );
}
