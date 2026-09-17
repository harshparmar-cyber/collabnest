
import {
  Bell,
  BriefcaseBusiness,
  Home,
  MessageCircle,
  Search,
  UserRound,
} from "lucide-react";

import ProjectCard from "./ProjectCard";
import type { ReactNode } from "react";

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: boolean;
}

const NavItem = ({
  icon,
  label,
  active,
  badge,
}: NavItemProps) => {
  return (
    <div
      className={`
        relative
        flex
        flex-col
        items-center
        gap-1
        ${active ? "text-[#147de8]" : "text-[#8194ab]"}
      `}
    >

      {icon}

      <span className="text-[7px] font-medium">
        {label}
      </span>

      {badge && (
        <span
          className="
            absolute
            -right-2
            -top-2
            flex
            h-[12px]
            w-[12px]
            items-center
            justify-center
            rounded-full
            bg-red-500
            text-[6px]
            text-white
          "
        >
          2
        </span>
      )}

    </div>
  );
};

const ProjectPhone = () => {
  return (
    <div
  className="
    relative
    h-[680px]
    w-[340px]
    overflow-hidden
    rounded-[55px]
    border-[8px]
    border-[#111827]
    bg-[#111827]
    shadow-[0_25px_60px_rgba(0,0,0,0.35)]
  "
>

      {/* Outer highlight */}
      <div className="absolute inset-[2px] rounded-[39px] border border-[#75aee5]" />

      {/* Screen */}
      <div
        className="
          absolute
          inset-[8px]
          overflow-hidden
          rounded-[34px]
          bg-[#f8fbff]
        "
      >

        {/* Dynamic Island */}
        <div
          className="
            absolute
            left-1/2
            top-[9px]
            z-20
            h-[27px]
            w-[103px]
            -translate-x-1/2
            rounded-full
            bg-[#07152b]
          "
        />

        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-[17px] text-[8px] font-bold text-[#15243b]">

          <span>9:41</span>

          <div className="flex items-center gap-1">
            <span>▮▮▮</span>
            <span>◉</span>
            <span>▰</span>
          </div>

        </div>

        {/* Greeting */}
        <div className="mt-7 flex items-center justify-between px-5">

          <div className="flex items-center gap-2">

            <div
              className="
                flex
                h-[30px]
                w-[30px]
                items-center
                justify-center
                rounded-full
                bg-[#d7e7f5]
                text-[11px]
              "
            >
              👨🏻
            </div>

            <div>

              <p className="text-[11px] font-bold text-[#1a2f4c]">
                Hi, Harsh 👋
              </p>

              <p className="text-[7px] text-[#7d91aa]">
                Great to see you back!
              </p>

            </div>

          </div>

          <div className="relative">

            <Bell size={17} className="text-[#162b47]" />

            <span className="absolute -right-1 -top-1 h-[7px] w-[7px] rounded-full bg-red-500" />

          </div>

        </div>

        {/* Search */}
        <div
          className="
            mx-5
            mt-4
            flex
            h-[38px]
            items-center
            gap-2
            rounded-full
            bg-[#eef4fb]
            px-3
            text-[#88a0bc]
          "
        >

          <Search size={15} />

          <span className="text-[8px]">
            Search projects, people or skills...
          </span>

        </div>

        {/* Categories */}
        <div className="mt-3 flex gap-2 overflow-hidden px-5">

          <span className="rounded-full bg-[#1c83ed] px-3 py-[6px] text-[8px] font-semibold text-white">
            All
          </span>

          <span className="rounded-full bg-[#f0f5fa] px-3 py-[6px] text-[8px] text-[#536b87]">
            Web Dev
          </span>

          <span className="rounded-full bg-[#f0f5fa] px-3 py-[6px] text-[8px] text-[#536b87]">
            AI/ML
          </span>

          <span className="rounded-full bg-[#f0f5fa] px-3 py-[6px] text-[8px] text-[#536b87]">
            Design
          </span>

        </div>

        {/* Popular Projects */}
        <div className="mt-4 flex items-center justify-between px-5">

          <h2 className="text-[11px] font-bold text-[#142d4e]">
            Popular Project Ideas
          </h2>

          <span className="text-[8px] font-semibold text-[#1681ec]">
            See all
          </span>

        </div>

        {/* Cards */}
        <div className="mt-2 space-y-2 px-5">

          <ProjectCard
            type="ai"
            title="AI Study Buddy"
            description="Build an AI-powered study assistant with real-time help and explanations."
            tags={["AI/ML", "Web Dev"]}
            interested={4}
          />

          <ProjectCard
            type="eco"
            title="EcoTrack – Carbon Footprint Tracker"
            description="A mobile app to track daily carbon footprint and promote green living."
            tags={["Mobile", "UI/UX"]}
            interested={3}
          />

          <ProjectCard
            type="event"
            title="College Event Hub"
            description="A platform to discover and manage college events, clubs and activities."
            tags={["Web Dev", "Full Stack"]}
            interested={5}
          />

        </div>

        {/* Bottom Navigation */}
        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            flex
            h-[66px]
            items-center
            justify-around
            border-t
            border-[#edf1f6]
            bg-white
          "
        >

          <NavItem
            icon={<Home size={18} />}
            label="Home"
            active
          />

          <NavItem
            icon={<BriefcaseBusiness size={18} />}
            label="Projects"
          />

          <NavItem
            icon={<MessageCircle size={18} />}
            label="Messages"
            badge
          />

          <NavItem
            icon={<UserRound size={18} />}
            label="Profile"
          />

        </div>

      </div>

    </div>
  );
};

export default ProjectPhone;