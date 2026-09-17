import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Send,
  Video,
} from "lucide-react";

interface MessageProps {
  name: string;
  time: string;
  avatar: string;
  text: string;
}

const Message = ({
  name,
  time,
  avatar,
  text,
}: MessageProps) => {
  return (
    <div className="flex items-start gap-2">

      <div
        className="
          flex
          h-[27px]
          w-[27px]
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#e1edf8]
          text-[11px]
        "
      >
        {avatar}
      </div>

      <div className="max-w-[190px]">

        <div className="flex items-center gap-2">

          <span className="text-[7px] font-bold text-[#49617e]">
            {name}
          </span>

          <span className="text-[6px] text-[#a0afc0]">
            {time}
          </span>

        </div>

        <div
          className="
            mt-1
            rounded-[14px]
            rounded-tl-[4px]
            bg-[#edf3f9]
            px-3
            py-2
            text-[8px]
            leading-[1.5]
            text-[#536b85]
          "
        >
          {text}
        </div>

      </div>

    </div>
  );
};

const ChatPhone = () => {
  return (
    <div
      className="
        relative
        z-20
        -ml-[70px]
        mt-[90px]
        h-[560px]
        w-[285px]
        rotate-[7deg]
        rounded-[43px]
        border-[6px]
        border-[#111827]
        bg-[#f8fbff]
        shadow-[15px_25px_50px_rgba(0,0,0,0.3)]
        sm:h-[635px]
        sm:w-[320px]
      "
    >

      <div className="absolute inset-[2px] rounded-[38px] border border-[#75aee5]" />

      <div
        className="
          absolute
          inset-[8px]
          overflow-hidden
          rounded-[33px]
          bg-[#f8fbff]
        "
      >

        {/* Status */}
        <div className="flex items-center justify-between px-5 pt-[16px] text-[8px] font-bold text-[#15243b]">

          <span>9:41</span>

          <div className="flex gap-1">
            <span>▮▮▮</span>
            <span>◉</span>
            <span>▰</span>
          </div>

        </div>

        {/* Dynamic Island */}
        <div
          className="
            absolute
            left-1/2
            top-[9px]
            h-[26px]
            w-[100px]
            -translate-x-1/2
            rounded-full
            bg-[#07152b]
          "
        />

        {/* Header */}
        <div
          className="
            mt-7
            flex
            items-center
            justify-between
            border-b
            border-[#edf1f6]
            px-4
            pb-3
          "
        >

          <div className="flex items-center gap-3">

            <ArrowLeft
              size={18}
              className="text-[#172b46]"
            />

            <div
              className="
                flex
                h-[31px]
                w-[31px]
                items-center
                justify-center
                rounded-[10px]
                bg-[#368de9]
                text-white
              "
            >
              👥
            </div>

            <div>

              <p className="text-[10px] font-bold text-[#172b46]">
                Project Collaboration
              </p>

              <p className="text-[7px] text-[#8496ab]">
                5 members
              </p>

            </div>

          </div>

          <MoreVertical
            size={18}
            className="text-[#647a94]"
          />

        </div>

        {/* Messages */}
        <div className="space-y-4 px-4 pt-5">

          <Message
            name="Riya"
            time="10:24 AM"
            avatar="👩🏻"
            text="Hey everyone! I'm working on the UI for our project. What do you think about this design?"
          />

          {/* Shared Design */}
          <div
            className="
              ml-[38px]
              h-[82px]
              w-[125px]
              rounded-[13px]
              bg-[#edf3fa]
              p-2
            "
          >

            <div className="h-full rounded-[8px] bg-white shadow-sm">

              <div className="flex h-full">

                <div className="w-1/2 border-r border-[#edf1f5] p-2">

                  <div className="h-2 w-12 rounded bg-[#dfeaf6]" />

                  <div className="mt-2 h-1 w-16 rounded bg-[#edf2f8]" />

                  <div className="mt-2 h-1 w-12 rounded bg-[#edf2f8]" />

                  <div className="mt-2 h-1 w-14 rounded bg-[#edf2f8]" />

                </div>

                <div className="w-1/2 bg-[#f1f7ff] p-2">

                  <div className="h-3 w-12 rounded bg-[#2d83e8]" />

                  <div className="mt-3 h-8 rounded bg-[#dcecff]" />

                </div>

              </div>

            </div>

          </div>

          {/* You */}
          <div className="flex justify-end">

            <div className="max-w-[175px]">

              <div
                className="
                  rounded-[15px]
                  rounded-br-[5px]
                  bg-gradient-to-br
                  from-[#2589f1]
                  to-[#146ed0]
                  px-3
                  py-3
                  text-[8px]
                  leading-[1.5]
                  text-white
                  shadow-sm
                "
              >
                Looks great! I'll handle the backend. Let's sync up at 7 PM today.
              </div>

              <p className="mt-1 text-right text-[6px] text-[#8ba0b8]">
                10:27 AM ✓✓
              </p>

            </div>

          </div>

          {/* Arjun */}
          <Message
            name="Arjun"
            time="10:32 AM"
            avatar="👨🏻"
            text="Sounds good! I'll share the API docs before the call."
          />

          {/* Call */}
          <div
            className="
              ml-[38px]
              flex
              w-[145px]
              items-center
              gap-2
              rounded-[13px]
              bg-[#edf5ff]
              px-3
              py-3
            "
          >

            <div
              className="
                flex
                h-[25px]
                w-[25px]
                items-center
                justify-center
                rounded-full
                bg-[#167bea]
                text-white
              "
            >
              <Video size={13} />
            </div>

            <div>

              <p className="text-[7px] font-semibold text-[#3478b8]">
                You created a call
              </p>

              <p className="text-[6px] text-[#8da0b7]">
                Today at 7:00 PM
              </p>

            </div>

          </div>

        </div>

        {/* Message Input */}
        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            border-t
            border-[#e8eef5]
            bg-white
            px-3
            py-3
          "
        >

          <div className="flex items-center gap-2">

            <Paperclip
              size={17}
              className="text-[#7f95ae]"
            />

            <div
              className="
                flex
                h-[38px]
                flex-1
                items-center
                rounded-full
                bg-[#f1f5f9]
                px-4
                text-[8px]
                text-[#8da0b7]
              "
            >
              Type a message...
            </div>

            <div
              className="
                flex
                h-[34px]
                w-[34px]
                items-center
                justify-center
                rounded-full
                bg-[#167fea]
                text-white
              "
            >
              <Send size={15} />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ChatPhone;