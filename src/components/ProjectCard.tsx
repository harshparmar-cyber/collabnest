import {
  ArrowRight,
  CalendarDays,
  Code2,
  Leaf,
} from "lucide-react";

interface ProjectCardProps {
  type: "ai" | "eco" | "event";
  title: string;
  description: string;
  tags: string[];
  interested: number;
}

const ProjectCard = ({
  type,
  title,
  description,
  tags,
  interested,
}: ProjectCardProps) => {

  const icon =
    type === "ai" ? (
      <Code2 size={21} />
    ) : type === "eco" ? (
      <Leaf size={21} />
    ) : (
      <CalendarDays size={21} />
    );

  const iconBackground =
    type === "ai"
      ? "bg-[#7167f8]"
      : type === "eco"
        ? "bg-[#35c17b]"
        : "bg-[#2196f3]";

  return (
    <div
      className="
        rounded-[17px]
        border
        border-[#e4eaf2]
        bg-white
        p-[11px]
        shadow-[0_4px_15px_rgba(40,75,110,0.07)]
      "
    >

      <div className="flex gap-3">

        {/* Icon */}
        <div
          className={`
            flex
            h-[38px]
            w-[38px]
            shrink-0
            items-center
            justify-center
            rounded-[10px]
            text-white
            ${iconBackground}
          `}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-1">

            <h3 className="text-[11px] font-bold text-[#172d4d]">
              {title}
            </h3>

            <ArrowRight
              size={14}
              className="shrink-0 text-[#7e9abd]"
            />

          </div>

          <p className="mt-1 text-[8px] leading-[1.4] text-[#70839c]">
            {description}
          </p>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1">

            {tags.map((tag) => (
              <span
                key={tag}
                className="
                  rounded-full
                  bg-[#edf5f8]
                  px-2
                  py-[3px]
                  text-[7px]
                  font-medium
                  text-[#477083]
                "
              >
                {tag}
              </span>
            ))}

          </div>

          {/* Interested */}
          <div className="mt-2 flex items-center gap-1">

            <div className="flex">

              <span className="h-[14px] w-[14px] rounded-full border border-white bg-[#e4b39d]" />

              <span className="-ml-1 h-[14px] w-[14px] rounded-full border border-white bg-[#7e9bc1]" />

              <span className="-ml-1 h-[14px] w-[14px] rounded-full border border-white bg-[#d5c19e]" />

            </div>

            <span className="text-[7px] text-[#6e8097]">
              {interested} interested
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProjectCard;