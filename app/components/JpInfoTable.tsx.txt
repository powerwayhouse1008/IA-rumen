type Row = { label: string; value: string };

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f3c9b8] px-2 py-1 text-[11px] font-bold border border-black">
      {children}
    </div>
  );
}

export function InfoTable({ rows }: { rows: Row[] }) {
  return (
    <div className="border border-black border-t-0 text-[11px]">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[92px_1fr] border-b border-black">
          <div className="bg-[#fde7dd] px-2 py-1 font-bold border-r border-black">
            {r.label}
          </div>
          <div className="px-2 py-1 whitespace-pre-wrap">{r.value}</div>
        </div>
      ))}
    </div>
  );
}