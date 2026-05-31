import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "./DatePicker";
import { getWorkoutsForDate } from "@/data/workouts";
import { formatDate } from "@/lib/date";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { date: dateParam } = await searchParams;
  const date = dateParam
    ? new Date(`${dateParam}T00:00:00`)
    : new Date();

  const workouts = await getWorkoutsForDate(date);

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            View your workouts by date.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0 flex flex-col gap-4">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Select Date
            </h2>
            <DatePicker selected={date} />
          </div>

          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Workouts for {formatDate(date)}
            </h2>

            {workouts.length === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                No workouts logged for this date.
              </p>
            ) : (
              workouts.map((workout) => (
                <Card key={workout.id} className="shadow-none border-zinc-200 dark:border-zinc-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                        {workout.name}
                      </CardTitle>
                      <Badge variant="secondary">
                        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-col gap-3">
                      {workout.exercises.map((exercise) => (
                        <li key={exercise.id} className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {exercise.name}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {exercise.sets.map((set) => (
                              <span
                                key={set.id}
                                className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                              >
                                {set.weightKg && parseFloat(set.weightKg) > 0
                                  ? `${set.reps} × ${set.weightKg} kg`
                                  : `${set.reps} rep${set.reps !== 1 ? "s" : ""}`}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
