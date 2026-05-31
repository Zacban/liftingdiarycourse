"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

type Props = {
  selected: Date;
};

export function DatePicker({ selected }: Props) {
  const router = useRouter();

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    router.push(`/dashboard?date=${iso}`);
  }

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={handleSelect}
      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3"
    />
  );
}
