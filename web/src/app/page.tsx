import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Crypto AI</h1>
        <p className="text-gray-600">Next.js + Tailwind + shadcn/ui</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/api/health">Health</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/api/analyze">Analyze (POST)</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/api/ask">Ask (POST)</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
