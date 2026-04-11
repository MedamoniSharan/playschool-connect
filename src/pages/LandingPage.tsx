import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "hsl(201, 100%, 13%)" }}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.6 }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to bottom, hsla(201,100%,13%,0.3), hsla(201,100%,13%,0.7))" }} />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-6 max-w-7xl mx-auto">
        <h1
          className="text-3xl tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif", color: "hsl(0, 0%, 100%)" }}
        >
          Smart Playschool<sup className="text-xs">®</sup>
        </h1>

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
          className="liquid-glass rounded-full px-6 py-2.5 text-sm cursor-pointer transition-transform hover:scale-[1.03]"
          style={{ color: "hsl(0,0%,100%)" }}
        >
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
          Smart Playschool Management — a seamless platform for managing students, classes, attendance,
          galleries, and fees. Built for administrators, teachers, and parents who care.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base cursor-pointer transition-transform hover:scale-[1.03] mt-12"
          style={{ color: "hsl(0,0%,100%)" }}
        >
          Begin Journey
        </button>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20 sm:pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Student Management", desc: "Add, manage, and assign students to classes and sections effortlessly." },
            { title: "Attendance Tracking", desc: "Mark and view attendance with real-time insights for every class." },
            { title: "Photo Gallery", desc: "Upload and share event photos — parents see only their child's media." },
            { title: "Fee Management", desc: "Create fee entries, track payments, and send reminders seamlessly." },
            { title: "Role-Based Access", desc: "Admin, teacher, and parent views — each with tailored capabilities." },
            { title: "Broadcast Alerts", desc: "Send announcements to all stakeholders instantly from the dashboard." },
          ].map((feature, i) => (
            <div
              key={i}
              className="liquid-glass rounded-2xl p-6 transition-transform hover:scale-[1.02]"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <h3
                className="text-lg font-normal mb-2"
                style={{ fontFamily: "'Instrument Serif', serif", color: "hsl(0,0%,100%)" }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(240,4%,66%)" }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
