import React from 'react'
// const UserHeatmap = (props: { userId:string, points:PointsList, completedWorkouts:CompletedWorkouts }) => {
import type { PointsList, CompletedWorkouts } from "~/pages/index";
import { getLast14Days, getDateString, sameDay, Tooltip } from "~/pages/index";
type Props = {
    userId: string;
    points: PointsList;
    completedWorkouts: CompletedWorkouts;
    weeks: number;
}
export function getLastXDays(days:number): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
}
export default function UserHeatmap({userId, points, completedWorkouts, weeks}: Props) {
        let lastXDays = getLastXDays(weeks * 7);
        if (weeks <= 2 ) {
          lastXDays = lastXDays.reverse();
        }
      
        return (
          <div className="grid w-fit grid-cols-7 gap-1">
            {lastXDays.map((date, index) => {
              const dateString = getDateString(date);
              // check if the user has a 'skipped' workout on this day
              // createdAt == date && authorId == userId && status == 'skipped'
              const skippedWorkout = completedWorkouts.find(
                (workout) =>
                  sameDay(workout.createdAt, date ) &&
                  workout.authorId === userId &&
                  workout.status === "skipped"
              );
      
              const userPoints = points[dateString]?.[userId] || 0;
              let bgColor;
              let border;
              switch (userPoints) {
                case 1:
                  bgColor = "bg-green-500 bg-opacity-50";
                  break;
                case 2:
                  bgColor = "bg-green-500 bg-opacity-75";
                  break;
                case 3:
                  bgColor = "bg-green-500 ";
                  break;
                default:
                  bgColor = "bg-neutral-700";
              }
      
              return (
                <div key={index}>
                <Tooltip
                  key={index}
                  content={`${userPoints} points on ${dateString}`}
                  // put z index on tooltip to make sure it's on top of the heatmap
                  
                  
                >
                  <div
                    className={` -z-40 h-4 w-4 hover:border-2 hover:border-neutral-300 ${
                      skippedWorkout !== undefined ? "border-2 border-red-500 hover:border-red-700" : ""
                    } ${bgColor || ""} ${border || ""} rounded`}
                  ></div>
                </Tooltip>
                </div>
              );
            })}
          </div>
        );
      }