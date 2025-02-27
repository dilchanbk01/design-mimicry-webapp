
import { EventShareMenu } from "./EventShareMenu";

interface EventTitleProps {
  title: string;
}

export function EventTitle({ title }: EventTitleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 flex-1">
        {title}
      </h1>
      <EventShareMenu />
    </div>
  );
}
