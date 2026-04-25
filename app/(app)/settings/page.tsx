import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { FixDatesButton } from "@/components/fix-dates-button";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold">Ajustes</h1>

      <div className="flex items-center gap-4 rounded-xl border p-4">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name ?? "Avatar"}
            className="size-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-xl font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <span className="truncate font-medium">{user?.name}</span>
          <span className="truncate text-sm text-muted-foreground">
            {user?.email}
          </span>
        </div>
      </div>

      <FixDatesButton />
      <SignOutButton />
    </div>
  );
}
