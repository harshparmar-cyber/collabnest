import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({
  icon,
  title,
  description,
}: FeatureCardProps) => {
  return (
    <div className="min-w-0">

      <div
        className="
          mb-3
          flex
          h-[57px]
          w-[62px]
          items-center
          justify-center
          rounded-[17px]
          border
          border-[#3f70ac]/60
          bg-gradient-to-br
          from-[#2860a3]
          to-[#173d78]
          text-[#d1eaff]
          shadow-[0_8px_25px_rgba(0,0,0,0.16)]
        "
      >
        {icon}
      </div>

      <h3 className="text-[14px] font-semibold text-[#e1ecf8] sm:text-[15px]">
        {title}
      </h3>

      <p className="mt-1 max-w-[145px] text-[12px] leading-[1.6] text-[#a9c0dc]">
        {description}
      </p>

    </div>
  );
};

export default FeatureCard;