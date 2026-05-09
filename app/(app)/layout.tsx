import { BottomNav } from "./_components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main id="main-content" tabIndex={-1} className="relative flex-1 overflow-y-auto outline-none">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
