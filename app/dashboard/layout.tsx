import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NavMenu } from "@/components/dashboard/nav-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavMenu />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
