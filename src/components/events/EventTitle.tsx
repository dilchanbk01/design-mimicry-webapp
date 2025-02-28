
interface EventTitleProps {
  title: string;
}

export function EventTitle({ title }: EventTitleProps) {
  return (
    <div className="mb-4 text-left">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    </div>
  );
}
