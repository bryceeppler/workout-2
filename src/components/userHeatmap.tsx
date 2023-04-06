import React from 'react'
// const UserHeatmap = (props: { userId:string, points:PointsList, completedWorkouts:CompletedWorkouts }) => {
import type { PointsList, CompletedWorkouts } from "~/pages/index";
import { getLast14Days, getDateString, sameDay, Tooltip } from "~/pages/index";
type Props = {
    userId: string;
    points: PointsList;
    completedWorkouts: CompletedWorkouts;
}

export default function UserHeatmap({userId, points, completedWorkouts}: Props) {
        const last14Days = getLast14Days();
      
        return (
          <div className="grid w-fit grid-cols-7 gap-1">
            {last14Days.reverse().map((date, index) => {
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
                <Tooltip
                  key={index}
                  content={`${userPoints} points on ${dateString}`}
                >
                  <div
                    className={` h-4 w-4 hover:border-2 hover:border-neutral-300 ${
                      skippedWorkout !== undefined ? "border-2 border-red-500 hover:border-red-700" : ""
                    } ${bgColor || ""} ${border || ""} rounded`}
                  ></div>
                </Tooltip>
              );
            })}
          </div>
        );
      };