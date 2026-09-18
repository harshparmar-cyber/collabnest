import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";

import Logo from "./Logo";

import leftStudent from "../assets/left.png";
import rightStudent from "../assets/right.png";

const AuthPage = () => {
  const location = useLocation();

  const isSignup = location.pathname === "/signup";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [animateFigures, setAnimateFigures] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");

  /* ================================================== */
  /* FIGURE ANIMATION */
  /* ================================================== */

  useEffect(() => {
    setAnimateFigures(false);
    setMessage("");

    const timer = setTimeout(() => {
      setAnimateFigures(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [isSignup]);

  /* ================================================== */
  /* TEMPORARY LOGIN */
  /* ================================================== */

  const handleLogin = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage(
      "Login will be connected with Firebase soon."
    );
  };

  /* ================================================== */
  /* TEMPORARY SIGNUP */
  /* ================================================== */

  const handleSignup = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setMessage(
      "Account creation will be connected with Firebase soon."
    );
  };

  return (
    <main
      className="
        relative
        min-h-svh
        w-full
        overflow-hidden
        bg-[#092b5d]
      "
    >
      {/* ================================================== */}
      {/* BACKGROUND */}
      {/* ================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_18%_20%,rgba(76,153,239,0.38),transparent_30%),radial-gradient(circle_at_82%_78%,rgba(70,145,230,0.28),transparent_32%),linear-gradient(135deg,#123d79_0%,#0b2f65_48%,#082753_100%)]
        "
      />

      {/* LEFT BACKGROUND GLOW */}

      <div
        className="
          absolute
          -left-[180px]
          -top-[180px]
          h-[500px]
          w-[500px]
          rounded-full
          bg-[#438fe8]/10
          blur-3xl
        "
      />

      {/* RIGHT BACKGROUND GLOW */}

      <div
        className="
          absolute
          -bottom-[200px]
          -right-[180px]
          h-[520px]
          w-[520px]
          rounded-full
          bg-[#438fe8]/10
          blur-3xl
        "
      />

      {/* ================================================== */}
      {/* LEFT STUDENT — TOP LEFT */}
      {/* ================================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          left-[-75px]
          top-[35px]
          z-10
          hidden
          transition-all
          duration-[1500ms]
          ease-out
          lg:block

          ${
            animateFigures
              ? "translate-x-0 opacity-100"
              : "-translate-x-[350px] opacity-0"
          }
        `}
      >
        <img
          src={leftStudent}
          alt=""
          className="
            h-auto
            w-[350px]
            object-contain
            drop-shadow-[0_20px_35px_rgba(0,0,0,0.20)]
          "
        />
      </div>

      {/* ================================================== */}
      {/* RIGHT STUDENT — BOTTOM RIGHT */}
      {/* ================================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          bottom-[-65px]
          right-[-75px]
          z-10
          hidden
          transition-all
          duration-[1500ms]
          ease-out
          lg:block

          ${
            animateFigures
              ? "translate-x-0 opacity-100"
              : "translate-x-[350px] opacity-0"
          }
        `}
      >
        <img
          src={rightStudent}
          alt=""
          className="
            h-auto
            w-[350px]
            object-contain
            drop-shadow-[0_20px_35px_rgba(0,0,0,0.20)]
          "
        />
      </div>

      {/* ================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================== */}

      <div
        className="
          relative
          z-20
          flex
          min-h-svh
          flex-col
          items-center
          justify-center
          px-5
          py-10
        "
      >
        {/* ================================================== */}
        {/* COLLABNEST LOGO */}
        {/* ================================================== */}

        <div
          className="
            relative
            z-40
            mb-[18px]
            flex
            justify-center
          "
        >
          <Logo />
        </div>

        {/* ================================================== */}
        {/* AUTH CARD */}
        {/* ================================================== */}

        <div
          className="
            relative
            z-30
            w-full
            max-w-[430px]
            rounded-[32px]
            border
            border-white/20
            bg-[#65a9e8]/80
            p-[7px]
            shadow-[0_30px_80px_rgba(0,0,0,0.30)]
            backdrop-blur-xl
          "
        >
          {/* INNER CARD */}

          <div
            className="
              rounded-[27px]
              border
              border-white/20
              bg-[#8bc1ef]/95
              px-6
              py-7
              sm:px-9
              sm:py-8
            "
          >
            {/* ================================================== */}
            {/* TITLE */}
            {/* ================================================== */}

            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="
                    h-[6px]
                    w-[6px]
                    rounded-full
                    bg-[#0759bd]
                  "
                />

                <span
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[1.5px]
                    text-[#246092]
                  "
                >
                  {isSignup
                    ? "Join CollabNest"
                    : "Welcome Back"}
                </span>
              </div>

              <h1
                className="
                  text-[30px]
                  font-bold
                  tracking-[-1px]
                  text-[#063878]
                "
              >
                {isSignup
                  ? "Create Account"
                  : "Welcome Back"}
              </h1>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-[1.5]
                  text-[#174d82]
                "
              >
                {isSignup
                  ? "Join students, share ideas, and build projects together."
                  : "Welcome back! Let's continue building together."}
              </p>
            </div>

            {/* ================================================== */}
            {/* FORM */}
            {/* ================================================== */}

            <form
              onSubmit={
                isSignup
                  ? handleSignup
                  : handleLogin
              }
              className="space-y-4"
            >
              {/* NAME */}

              {isSignup && (
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-[10px]
                      font-semibold
                      text-[#174d82]
                    "
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={15}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-[#3978ae]
                      "
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="Enter your name"
                      required
                      className="
                        h-[43px]
                        w-full
                        rounded-xl
                        border
                        border-[#65a5dd]
                        bg-white/75
                        pl-9
                        pr-3
                        text-[11px]
                        text-[#12365b]
                        outline-none
                        placeholder:text-[#7194b5]
                        transition
                        focus:border-[#176fd0]
                        focus:bg-white
                      "
                    />
                  </div>
                </div>
              )}

              {/* EMAIL */}

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-[10px]
                    font-semibold
                    text-[#174d82]
                  "
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={15}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-[#3978ae]
                    "
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    required
                    className="
                      h-[43px]
                      w-full
                      rounded-xl
                      border
                      border-[#65a5dd]
                      bg-white/75
                      pl-9
                      pr-3
                      text-[11px]
                      text-[#12365b]
                      outline-none
                      placeholder:text-[#7194b5]
                      transition
                      focus:border-[#176fd0]
                      focus:bg-white
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-[10px]
                    font-semibold
                    text-[#174d82]
                  "
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={15}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-[#3978ae]
                    "
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    className="
                      h-[43px]
                      w-full
                      rounded-xl
                      border
                      border-[#65a5dd]
                      bg-white/75
                      pl-9
                      pr-10
                      text-[11px]
                      text-[#12365b]
                      outline-none
                      placeholder:text-[#7194b5]
                      transition
                      focus:border-[#176fd0]
                      focus:bg-white
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-[#3978ae]
                      hover:text-[#0759bd]
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              {isSignup && (
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-[10px]
                      font-semibold
                      text-[#174d82]
                    "
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={15}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-[#3978ae]
                      "
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Confirm your password"
                      required
                      className="
                        h-[43px]
                        w-full
                        rounded-xl
                        border
                        border-[#65a5dd]
                        bg-white/75
                        pl-9
                        pr-10
                        text-[11px]
                        text-[#12365b]
                        outline-none
                        placeholder:text-[#7194b5]
                        transition
                        focus:border-[#176fd0]
                        focus:bg-white
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-[#3978ae]
                        hover:text-[#0759bd]
                      "
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* MESSAGE */}

              {message && (
                <div
                  className="
                    rounded-lg
                    bg-[#0759bd]/10
                    px-3
                    py-2
                    text-center
                    text-[9px]
                    font-medium
                    text-[#0759bd]
                  "
                >
                  {message}
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                className="
                  flex
                  h-[45px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-[#147bea]
                  to-[#0759bd]
                  text-[11px]
                  font-bold
                  tracking-wide
                  text-white
                  shadow-lg
                  shadow-[#0759bd]/25
                  transition
                  duration-200
                  hover:-translate-y-[1px]
                  hover:shadow-xl
                  active:translate-y-0
                "
              >
                {isSignup
                  ? "CREATE ACCOUNT"
                  : "LOGIN"}

                <ArrowRight size={15} />
              </button>
            </form>

            {/* ================================================== */}
            {/* LOGIN / SIGNUP SWITCH */}
            {/* ================================================== */}

            <div
              className="
                mt-5
                text-center
                text-[10px]
                text-[#356a9b]
              "
            >
              {isSignup ? (
                <>
                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="
                      font-bold
                      text-[#0759bd]
                      hover:underline
                    "
                  >
                    Login
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{" "}

                  <Link
                    to="/signup"
                    className="
                      font-bold
                      text-[#0759bd]
                      hover:underline
                    "
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;