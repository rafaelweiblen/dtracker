import { BottomNav } from "./_components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="relative flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
