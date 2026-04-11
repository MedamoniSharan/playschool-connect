import { useNavigate } from "react-router-dom";
import {
  School,
  Users,
} from "lucide-react";
import { LottieIcon } from "@/components/LottieIcon";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page relative min-h-screen overflow-hidden" style={{ background: "hsl(201, 100%, 13%)" }}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.85 }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to bottom, hsla(201,100%,13%,0.55), hsla(201,100%,13%,0.88))" }} />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Little Berries Logo" className="h-10 w-auto object-contain shrink-0 drop-shadow-lg" />
          <h1
            className="text-2xl sm:text-3xl tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif", color: "hsl(0, 0%, 100%)" }}
          >
            Little Berries<sup className="text-xs">®</sup>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Home", "About", "Features", "Contact"].map((link, i) => (
            <a
              key={link}
              href="#"
              className="text-sm transition-colors"
              style={{ color: i === 0 ? "hsl(0,0%,100%)" : "hsl(240,4%,66%)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0,0%,100%)")}
              onMouseLeave={(e) => { if (i !== 0) e.currentTarget.style.color = "hsl(240,4%,66%)"; }}
            >
              {link}
            </a>
          ))}
        </div>

        <button
          onClick={() => navigate("/login")}
          className="liquid-glass rounded-full px-6 py-2.5 text-sm cursor-pointer transition-transform hover:scale-[1.03] inline-flex items-center gap-2"
          style={{ color: "hsl(0,0%,100%)" }}
        >
          <School size={16} strokeWidth={2} className="opacity-90 shrink-0" aria-hidden />
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 sm:pt-32 pb-20 sm:pb-40">
        <h2
          className="animate-fade-rise text-4xl sm:text-6xl md:text-8xl font-normal max-w-7xl"
          style={{
            fontFamily: "'Instrument Serif', serif",
            color: "hsl(0,0%,100%)",
            lineHeight: "0.95",
            letterSpacing: "-2.46px",
          }}
        >
          Where <em className="not-italic" style={{ color: "hsl(240,4%,66%)" }}>dreams</em> rise{" "}
          <em className="not-italic" style={{ color: "hsl(240,4%,66%)" }}>through the silence.</em>
        </h2>

        <p
          className="animate-fade-rise-delay text-base sm:text-lg max-w-2xl mt-8 leading-relaxed"
          style={{ color: "hsl(240,4%,66%)" }}
        >
          Little Berries Management — a seamless platform for managing students, classes, attendance,
          galleries, and fees. Built for administrators, teachers, and parents who care.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base cursor-pointer transition-transform hover:scale-[1.03] mt-12 inline-flex items-center gap-2.5"
          style={{ color: "hsl(0,0%,100%)" }}
        >
          <Users size={18} strokeWidth={2} className="opacity-90 shrink-0" aria-hidden />
          Begin Journey
        </button>
      </section>


    </div>
  );
}
