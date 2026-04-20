import { BottomNav } from "./_components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav />
    </>
  );
}
