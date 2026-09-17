const Logo = () => {
  return (
    <div className="flex items-center gap-4">

      {/* People Logo */}
      <div className="relative h-[62px] w-[70px]">

        {/* Left body */}
        <div
          className="
            absolute
            left-[4px]
            top-[28px]
            h-[31px]
            w-[29px]
            rounded-t-[16px]
            bg-gradient-to-br
            from-[#d9f0ff]
            to-[#64aaf0]
          "
        />

        {/* Right body */}
        <div
          className="
            absolute
            left-[35px]
            top-[27px]
            h-[34px]
            w-[30px]
            rounded-t-[17px]
            bg-gradient-to-br
            from-[#d9f0ff]
            to-[#5598e4]
          "
        />

        {/* Left head */}
        <div
          className="
            absolute
            left-[10px]
            top-[8px]
            h-[19px]
            w-[19px]
            rounded-full
            bg-[#c9e7ff]
          "
        />

        {/* Right head */}
        <div
          className="
            absolute
            left-[37px]
            top-[1px]
            h-[24px]
            w-[24px]
            rounded-full
            bg-gradient-to-br
            from-[#e0f3ff]
            to-[#75b0eb]
          "
        />

      </div>

      {/* Text */}
      <div>
  <h1
    className="
      text-[28px]
      font-bold
      leading-none
      tracking-[-1px]
    "
  >
    <span className="text-white">Collab</span>
    <span className="text-[#6ca9e8]">Nest</span>
  </h1>

  <p
    className="
      mt-[7px]
      text-[14px]
      font-medium
      leading-none
      text-[#d4e7fa]
    "
  >
    Ideas
    <span className="mx-[7px] text-[#9fc9ef]">›</span>
    People
    <span className="mx-[7px] text-[#9fc9ef]">›</span>
    Projects
  </p>
</div>

    </div>
  );
};

export default Logo;