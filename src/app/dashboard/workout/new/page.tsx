"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkoutAction } from "./actions";
import { useActionState } from "react";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type State = { error?: string } | null;

async function formAction(_prev: State, formData: FormData): Promise<State> {
  const name = formData.get("name") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  try {
    await createWorkoutAction(name, date, time);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  return null;
}

export default function NewWorkoutPage() {
  const [state, dispatch, isPending] = useActionState(formAction, null);
  const searchParams = useSearchParams();
  const defaultDate = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");
  const defaultTime = format(new Date(), "HH:mm");

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-lg mx-auto px-4 py-10 flex flex-col gap-8">
        <Card className="shadow-none border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <Link
              href={`/dashboard?date=${defaultDate}`}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors w-fit"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              New Workout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={dispatch} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Workout name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Push Day"
                  required
                  maxLength={255}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={defaultDate}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 w-36">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    defaultValue={defaultTime}
                    required
                  />
                </div>
              </div>

              {state?.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving…" : "Create Workout"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
