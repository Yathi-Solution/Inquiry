import { AirVent } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function Navbar() {
  return (
    <div className="border-b px-4">
      <div className="flex items-centre justify-between mx-auto max-w-4xl h-16">
        <Link href="/" className="flex items-center gap-2">
          <AirVent className="h-6 w-6" />
          <span className="font-bold">
            Sales<span className="text-red-600">Tracker</span>
          </span>
        </Link>
        <div className="self-center">
          <Link href="/create" className="px-6">
            Create
          </Link>
          <Link href="/dashboard" className="px-6">
            Dashboard
          </Link>
          <Link href="/sign-in" className={`${buttonVariants()} px-6`}>
            SignIn or LogIn
          </Link>
        </div>
      </div>
    </div>
  );
}
