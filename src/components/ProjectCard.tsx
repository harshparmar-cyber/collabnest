import {
  ArrowRight,
  CalendarDays,
  Code2,
  Leaf,
  User,
} from "lucide-react";

interface ProjectCardProps {
  type: "ai" | "eco" | "event";
  title: string;
  description: string;
  tags: string[];
  interested?: number;

  // Project owner
  ownerName?: string;
  ownerPhoto?: string;
  onOwnerClick?: () => void;

  // Project details
  onView?: () => void;
}

const ProjectCard = ({
  type,
  title,
  description,
  tags,
  interested = 0,
  ownerName,
  ownerPhoto,
  onOwnerClick,
  onView,
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
        transition
        duration-200
        hover:-translate-y-[2px]
        hover:shadow-[0_8px_24px_rgba(40,75,110,0.11)]
      "
    >
      <div className="flex gap-3">

        {/* Project Icon */}
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

          {/* Title */}
          <div className="flex items-start justify-between gap-1">
            <h3 className="truncate text-[11px] font-bold text-[#172d4d]">
              {title}
            </h3>

            <ArrowRight
              size={14}
              className="shrink-0 text-[#7e9abd]"
            />
          </div>

          {/* Description */}
          <p className="mt-1 line-clamp-2 text-[8px] leading-[1.4] text-[#70839c]">
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

          {/* Bottom Section */}
          <div className="mt-2 flex items-center justify-between gap-2">

            {/* Owner */}
            <div className="flex min-w-0 items-center gap-1">

              {ownerName && (
                <button
                  type="button"
                  onClick={onOwnerClick}
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-1.5
                    rounded-full
                    transition
                    hover:opacity-80
                  "
                >
                  {/* Profile Photo */}
                  <span
                    className="
                      flex
                      h-[18px]
                      w-[18px]
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-full
                      bg-[#dcecff]
                      text-[#1684ff]
                    "
                  >
                    {ownerPhoto ? (
                      <img
                        src={ownerPhoto}
                        alt={ownerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={10} />
                    )}
                  </span>

                  {/* Owner Name */}
                  <span
                    className="
                      max-w-[90px]
                      truncate
                      text-[7px]
                      font-semibold
                      text-[#477083]
                    "
                  >
                    {ownerName}
                  </span>
                </button>
              )}

              {/* Interested Avatars */}
              <div className="flex shrink-0">
                <span className="h-[14px] w-[14px] rounded-full border border-white bg-[#e4b39d]" />

                <span className="-ml-1 h-[14px] w-[14px] rounded-full border border-white bg-[#7e9bc1]" />

                <span className="-ml-1 h-[14px] w-[14px] rounded-full border border-white bg-[#d5c19e]" />
              </div>

              <span className="whitespace-nowrap text-[7px] text-[#6e8097]">
                {interested} interested
              </span>
            </div>

            {/* View Button */}
            {onView && (
              <button
                type="button"
                onClick={onView}
                className="
                  shrink-0
                  text-[8px]
                  font-bold
                  text-[#1684ff]
                  transition
                  hover:underline
                "
              >
                View →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;