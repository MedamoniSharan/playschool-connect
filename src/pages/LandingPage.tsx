import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  School, Users, Award, ToyBrick, Palette, Puzzle, PartyPopper,
  ChevronRight, Facebook, Twitter, Instagram, Mail, Phone, MapPin,
  Star, Cloud, Sun, Menu, X, Sparkles, Heart, Music, Tent, Monitor,
  Video, BookOpen, Dumbbell, Brush, Swords, CheckCircle, Clock, Baby,
  GraduationCap, Flower2, ShieldCheck, Microscope
} from "lucide-react";

/* ── helpers ── */
const CloudDivider = ({ color = "#FFD700", flip = false }: { color?: string; flip?: boolean }) => (
  <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""}`}>
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[80px]" fill={color}>
      <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,42.47V0Z" opacity=".25" />
      <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,104.5,20.85,35.74,12.15,72,25.2,110.1,30,68.9,8.73,137.64-12,197-47,56-33,126-10,186,18,33,15,66.86,30.34,103.87,35,46,5.81,93.43-15.17,133.43-41V0Z" opacity=".5" />
      <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.41,78.3,34.19,158.25,48.13,243.4,26,71-18.45,133.45-56,187.6-97.53V0Z" />
    </svg>
  </div>
);

const Doodle = ({ icon: Icon, className, color = "currentColor", size = 24 }: { icon: any; className?: string; color?: string; size?: number }) => (
  <div className={`absolute pointer-events-none opacity-20 animate-float ${className}`}>
    <Icon size={size} style={{ color }} />
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, color }: { icon: any; title: string; description: string; color: string }) => (
  <div className="relative bg-white rounded-[2rem] p-8 pt-16 text-center transition-all hover:-translate-y-3 hover:shadow-2xl shadow-lg border-b-8 group" style={{ borderColor: color }}>
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-gray-50 group-hover:scale-110 transition-transform">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
        <Icon size={38} style={{ color }} />
      </div>
    </div>
    <h3 className="text-xl font-black mb-3" style={{ color }}>{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed font-semibold">{description}</p>
    <div className="mt-6 flex justify-center">
      <button className="w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-all hover:rotate-12 hover:scale-110" style={{ backgroundColor: color }}>
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
);

/* ── programme data ── */
const programmes = [
  {
    name: "Daycare",
    age: "6 Months+",
    color: "#26B4D7",
    icon: Baby,
    skills: ["Extended hours care", "Homework assistance", "After-school activities"],
    desc: "Flexible 3-hour or full-day options offering a safe, nurturing environment for your little one.",
  },
  {
    name: "Playgroup",
    age: "1.5+ Years",
    color: "#e83e8c",
    icon: Heart,
    skills: ["15:1 teacher ratio", "Pre-writing skills", "Activity-based learning"],
    desc: "A magical world of exploration that builds curiosity and early developmental foundations.",
  },
  {
    name: "Pre-KG",
    age: "2.5+ Years",
    color: "#28a745",
    icon: Flower2,
    skills: ["Numeracy & problem-solving", "Independence skills", "Field trips & splash days"],
    desc: "A Foundation for Growth — fostering independence, numeracy, and joyful discovery.",
  },
  {
    name: "LKG",
    age: "3.5+ Years",
    color: "#fd7e14",
    icon: BookOpen,
    skills: ["Math: addition & subtraction", "English CVC words", "Learn-by-doing method"],
    desc: "Advanced concepts through Experimental Learning — making every lesson an adventure.",
  },
  {
    name: "UKG",
    age: "4.5+ Years",
    color: "#6f42c1",
    icon: GraduationCap,
    skills: ["2-digit math & fractions", "English phonetics", "Graduation ceremony"],
    desc: "Preparing confident, school-ready learners with complex skills and a love for knowledge.",
  },
];

/* ── extracurricular data ── */
const extraCurricular = [
  { name: "Western Dance", icon: Music, color: "#e83e8c" },
  { name: "Gymnastics", icon: Dumbbell, color: "#fd7e14" },
  { name: "Drawing & Art", icon: Brush, color: "#28a745" },
  { name: "Karate", icon: Swords, color: "#ED1C24" },
  { name: "Chess", icon: Puzzle, color: "#0056B3" },
  { name: "Indian Abacus", icon: Microscope, color: "#6f42c1" },
  { name: "Phonics", icon: BookOpen, color: "#26B4D7" },
  { name: "Keyboard", icon: Music, color: "#28a745" },
];

/* ── locations ── */
const locations = [
  { area: "Purasaiwakkam", address: "Old No:51, New No:63, Vellala Street\n(Near Saravana Bhavan)" },
  { area: "Sowcarpet", address: "No 8, Vadamalai Street\n(Near Old MINT APOLLO)" },
  { area: "Vyasarpadi", address: "No 6/48, 1st St, Vyasar Nagar\n(Next to Radiance Empire)" },
];

/* ══════════════════════════════════ MAIN ══════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home",           href: "#hero",           color: "#28a745" },
    { name: "About",          href: "#about",          color: "#e83e8c" },
    { name: "Programmes",     href: "#courses",        color: "#17a2b8" },
    { name: "Infrastructure", href: "#infrastructure", color: "#ffc107" },
    { name: "Activities",     href: "#activities",     color: "#fd7e14" },
    { name: "Admissions",     href: "#admissions",     color: "#6f42c1" },
    { name: "Gallery",        href: "#gallery",        color: "#007bff" },
    { name: "Contact",        href: "#footer",         color: "#ED1C24" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-yellow-200 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dosis:wght@400;600;700;800&display=swap');
        @keyframes float {
          0%   { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .hero-pattern { background-image: radial-gradient(#ffffff 2px, transparent 2px); background-size: 30px 30px; }
        html { scroll-behavior: smooth; }
        .dosis { font-family: 'Dosis', sans-serif; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-[100] h-20 flex items-center justify-center border-b-4 border-yellow-400 shadow-md">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="relative">
              <div className="absolute -inset-2 bg-yellow-400 rounded-full blur opacity-40 group-hover:opacity-100 transition-opacity" />
              <img src="/logo.png" alt="Little Berries Logo" className="relative h-14 w-auto object-contain transition-transform group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black italic tracking-tight dosis" style={{ color: "#ED1C24", textShadow: "2px 2px 0px #FFD700" }}>LITTLE BERRIES</h1>
              <span className="text-[10px] font-black text-[#0056B3] tracking-widest uppercase">Montessori | 20 Years of Excellence</span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-5">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-[13px] font-black transition-all hover:scale-110 hover:-translate-y-1 block py-2 dosis" style={{ color: link.color }}>
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="bg-[#ED1C24] text-white px-6 py-3 rounded-[2rem] font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_5px_0_0_#9a1217] hover:shadow-[0_3px_0_0_#9a1217] hover:translate-y-[2px]">
              LOGIN
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="xl:hidden p-2.5 rounded-2xl bg-gray-100 text-gray-800 hover:bg-yellow-400 transition-colors">
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 top-[calc(80px+28px)] bg-white z-[90] xl:hidden overflow-y-auto">
            <div className="p-8 flex flex-col gap-5">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black text-center border-b-2 border-gray-100 pb-4 last:border-0 dosis" style={{ color: link.color }}>
                  {link.name}
                </a>
              ))}
              <button onClick={() => { setIsMenuOpen(false); navigate("/login"); }}
                className="bg-[#ED1C24] text-white w-full py-5 rounded-[2.5rem] font-black text-xl mt-2 shadow-[0_8px_0_0_#9a1217]">
                PARENT LOGIN
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section id="hero" className="relative min-h-[700px] flex items-center overflow-hidden bg-sky-400 hero-pattern pt-20 lg:pt-0">
        <Doodle icon={Star} className="top-16 left-[8%]" color="#FFD700" size={48} />
        <Doodle icon={Cloud} className="top-32 right-[12%]" color="#FFFFFF" size={80} />
        <Doodle icon={Sun} className="bottom-16 left-[18%]" color="#FFD700" size={90} />
        <Doodle icon={Puzzle} className="top-[45%] left-[4%]" color="#4834d4" size={52} />

        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center relative z-10 w-full py-20">
          <div className="text-left">
            <div className="inline-block bg-yellow-400 text-[#0056B3] px-6 py-2 rounded-full font-black text-sm mb-5 shadow-lg rotate-[-2deg] dosis">
              🏆 20 YEARS OF NURTURING EXCELLENCE
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.95] mb-6 drop-shadow-2xl dosis">
              Play, Learn<br />
              <span className="text-yellow-400">&amp; Grow</span><br />
              Together!
            </h2>
            <p className="text-white text-lg md:text-xl font-bold mb-8 max-w-lg leading-relaxed drop-shadow-md">
              Our goal is to provide a complete nurturing environment for the growth and development of the whole child — through Montessori, blended learning, and joyful exploration.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#admissions" className="bg-white text-red-600 px-10 py-4 rounded-[2.5rem] font-black text-lg hover:scale-105 transition-all shadow-[0_8px_0_0_#ddd] active:translate-y-2 active:shadow-none dosis">
                ENROLL NOW
              </a>
              <a href="#courses" className="bg-[#0056B3] text-white px-10 py-4 rounded-[2.5rem] font-black text-lg hover:scale-105 transition-all shadow-[0_8px_0_0_#003c7e] active:translate-y-2 active:shadow-none dosis">
                OUR PROGRAMMES
              </a>
            </div>
          </div>

          <div className="relative group flex justify-center lg:justify-end">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all" />
            <img
              src="https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=900"
              alt="Happy Kids Learning"
              className="relative w-full max-w-sm rounded-[3.5rem] border-8 border-white shadow-2xl rotate-3 transition-transform group-hover:rotate-0"
            />
          </div>
        </div>
      </section>

      <CloudDivider />

      {/* ══ ABOUT / WHY ══ */}
      <section id="about" className="py-28 bg-white relative overflow-hidden">
        <Doodle icon={Palette} className="top-10 right-10" color="#e83e8c" size={64} />
        <Doodle icon={ToyBrick} className="bottom-10 left-10" color="#17a2b8" size={64} />

        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-block bg-pink-100 text-pink-600 px-8 py-2 rounded-full font-black text-sm mb-4 uppercase tracking-wider dosis">
              About Little Berries
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#0056B3] mb-4 tracking-tight dosis">Why Choose Little Berries?</h2>
            <p className="text-gray-500 font-bold max-w-2xl mx-auto">
              Celebrating each child's unique potential — fostering a love for learning through play-based activities, academic excellence, and holistic development.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              {["bg-red-400", "bg-blue-400", "bg-yellow-400", "bg-green-400", "bg-pink-400"].map((c, i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${c}`} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-8">
            <FeatureCard icon={School} color="#26B4D7" title="Montessori Methodology"
              description="Promoting holistic development through critical thinking, hands-on exploration, and a nurturing child-led environment." />
            <FeatureCard icon={BookOpen} color="#28a745" title="Blended Learning Curriculum"
              description="Using books, labs, and smart classrooms for comprehensive instruction that engages every child's learning style." />
            <FeatureCard icon={Tent} color="#fd7e14" title="Indoor & Outdoor Learning"
              description="Supplementing traditional classrooms with outdoor activities, sensory walks, and gardening for real-world discovery." />
            <FeatureCard icon={Monitor} color="#6f42c1" title="Smart Classes"
              description="Gadget-savvy digital learning experiences that make every lesson as fun as watching their favourite cartoons!" />
            <FeatureCard icon={ShieldCheck} color="#ED1C24" title="Safety First"
              description="Strict child safety protocols, CCTV surveillance, and trained staff ensure your child is always safe and secure." />
            <FeatureCard icon={Users} color="#e83e8c" title="World-Class Amenities"
              description="Sand pit, Splash Pool, Ball Room, AV Room, and Doll House — a magical universe for curious little minds." />
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section id="stats" className="bg-yellow-400 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-10 text-center relative z-10">
          {[
            { label: "Years of Excellence", count: "20+", color: "#ED1C24" },
            { label: "City Branches",       count: "3",   color: "#0056B3" },
            { label: "Happy Students",      count: "1500+", color: "#28a745" },
            { label: "Teacher Ratio",       count: "15:1", color: "#6f42c1" },
          ].map((stat, i) => (
            <div key={i} className="group cursor-default">
              <div className="text-4xl md:text-6xl font-black mb-2 transition-transform group-hover:scale-125 select-none dosis" style={{ color: stat.color }}>
                {stat.count}
              </div>
              <div className="text-sm font-black text-gray-800 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </section>

      {/* ══ PROGRAMMES ══ */}
      <section id="courses" className="py-28 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-600 px-8 py-2 rounded-full font-black text-sm mb-4 uppercase tracking-wider dosis">
              Our Programmes
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-red-600 mb-4 dosis">Berry Programmes</h2>
            <p className="text-gray-500 font-bold max-w-2xl mx-auto italic">
              Specially designed programmes for every age group — ensuring holistic development from 6 months to 5+ years.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {programmes.map((prog, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] p-7 shadow-xl border-b-8 transition-transform hover:-translate-y-4 flex flex-col" style={{ borderColor: prog.color }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: `${prog.color}18` }}>
                  <prog.icon size={28} style={{ color: prog.color }} />
                </div>
                <h4 className="text-2xl font-black mb-1 dosis" style={{ color: prog.color }}>{prog.name}</h4>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{prog.age}</p>
                <p className="text-xs text-gray-600 font-semibold leading-relaxed mb-4 flex-1">{prog.desc}</p>
                <ul className="space-y-2 mb-6">
                  {prog.skills.map(s => (
                    <li key={s} className="flex items-start gap-2 text-xs font-bold text-gray-600">
                      <Sparkles size={12} className="text-yellow-400 mt-0.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
                <a href="#admissions" className="w-full py-3 rounded-2xl font-black text-white text-sm text-center shadow-md block dosis" style={{ backgroundColor: prog.color }}>
                  ENROLL
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INFRASTRUCTURE ══ */}
      <section id="infrastructure" className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-yellow-400 rounded-[4rem] rotate-3 -z-10 opacity-20 group-hover:rotate-0 transition-transform" />
              <img
                src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=900"
                alt="Little Berries Infrastructure"
                className="rounded-[3rem] shadow-2xl w-full h-[460px] object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="inline-block bg-orange-100 text-orange-600 px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider dosis">
                Our Campus
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-[#0056B3] leading-tight dosis">
                World-Class<br /><span className="text-red-600">Infrastructure</span>
              </h2>
              <p className="text-lg text-gray-600 font-bold leading-relaxed">
                A safe, sanitized, and playful environment equipped with modern educational amenities designed to spark every child's imagination.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { text: "Smart Classes",      icon: Monitor,    bg: "bg-blue-50",   color: "text-blue-600" },
                  { text: "Montessori Lab",     icon: Microscope, bg: "bg-green-50",  color: "text-green-600" },
                  { text: "Activity Lab",       icon: Puzzle,     bg: "bg-purple-50", color: "text-purple-600" },
                  { text: "Splash Pool",        icon: Flower2,    bg: "bg-sky-50",    color: "text-sky-600" },
                  { text: "Sand Pit & Ball Room", icon: Tent,     bg: "bg-yellow-50", color: "text-yellow-600" },
                  { text: "AV Room & Doll House", icon: Video,    bg: "bg-pink-50",   color: "text-pink-600" },
                  { text: "CCTV Safety Cams",   icon: Video,      bg: "bg-red-50",    color: "text-red-600" },
                  { text: "Outdoor Gardens",    icon: Flower2,    bg: "bg-emerald-50",color: "text-emerald-600" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-black text-gray-800 text-sm tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ EXTRACURRICULAR ══ */}
      <section id="activities" className="py-28 bg-gray-50 relative overflow-hidden">
        <Doodle icon={Star} className="top-10 right-10" color="#FFD700" size={80} />
        <Doodle icon={Cloud} className="bottom-10 left-10" color="#26B4D7" size={100} />

        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 text-green-600 px-8 py-2 rounded-full font-black text-sm mb-4 uppercase tracking-wider dosis">
              Beyond the Classroom
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#0056B3] mb-4 dosis">Evening Activities</h2>
            <p className="text-gray-500 font-bold max-w-2xl mx-auto">
              Discover talents, build skills, and have a blast with our after-school extracurricular programmes.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {extraCurricular.map((act, i) => (
              <div key={i} className="bg-white rounded-3xl p-7 shadow-lg text-center transition-all hover:-translate-y-3 hover:shadow-2xl border-b-4 group" style={{ borderColor: act.color }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: `${act.color}18` }}>
                  <act.icon size={32} style={{ color: act.color }} />
                </div>
                <h4 className="font-black text-gray-800 text-sm dosis">{act.name}</h4>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-500 font-bold text-sm">
              Also: Jolly Grammar · Handwriting · Zumba (Ladies Batch) · Tuitions
            </p>
          </div>
        </div>
      </section>

      {/* ══ ADMISSIONS ══ */}
      <section id="admissions" className="py-24 bg-sky-400 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white text-center mb-6 dosis">Join the Berry Family!</h2>
          <p className="text-white/90 font-bold text-center mb-16 max-w-xl mx-auto">
            Admissions open for all programmes. Visit us or call to schedule a free school tour.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { step: "01", title: "Call / Apply Online", desc: "Reach out via phone or fill the inquiry form", color: "#28a745" },
              { step: "02", title: "School Tour", desc: "Visit any of our 3 Chennai branches for a guided tour", color: "#fd7e14" },
              { step: "03", title: "Join the Journey!", desc: "Complete enrollment and begin your child's story", color: "#ED1C24" },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-[3rem] text-center border-4 border-white/20 hover:bg-white transition-all group">
                <div className="text-5xl font-black text-white/40 mb-3 group-hover:text-sky-400 transition-colors dosis">{item.step}</div>
                <h4 className="text-2xl font-black text-white group-hover:text-[#0056B3] transition-colors mb-2 dosis">{item.title}</h4>
                <p className="text-white/70 group-hover:text-gray-600 text-sm font-bold transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {["+91-98406 38000", "+91-98407 38000", "+91-97901 77888"].map((num) => (
              <a key={num} href={`tel:${num.replace(/\s/g, "")}`}
                className="flex items-center gap-2 bg-white text-[#0056B3] px-7 py-4 rounded-full font-black text-sm shadow-lg hover:scale-105 transition-all">
                <Phone size={16} className="text-[#ED1C24]" /> {num}
              </a>
            ))}
          </div>
        </div>
        <Doodle icon={Star} className="top-10 left-10" color="white" size={80} />
        <Doodle icon={Cloud} className="bottom-10 right-10" color="white" size={130} />
      </section>

      {/* ══ GALLERY ══ */}
      <section id="gallery" className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-6xl font-black text-[#0056B3] mb-4 dosis">Our Happy Moments</h2>
            <div className="w-28 h-2 bg-yellow-400 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "1503454537195-1dcabb73ffb9",
              "1544367567-0f2fcb009e0b",
              "1596464716127-f2a82984de30",
              "1488521787991-ed7bbaae773c",
            ].map((id, i) => (
              <img key={i}
                src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=500`}
                className="rounded-3xl w-full h-[260px] object-cover hover:scale-105 transition-transform cursor-pointer shadow-lg"
                alt={`Little Berries Gallery ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <Doodle icon={Star} className="top-10 left-10" color="#FFD700" size={70} />
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-6xl font-black text-[#0056B3] mb-4 dosis">What Parents Say</h2>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Priya Ramesh", text: "Little Berries has been an amazing start for my daughter. The Montessori approach and loving teachers made her transition into school life so smooth.", branch: "Purasaiwakkam" },
              { name: "Karthik Sundaram", text: "The safety protocols and CCTV monitoring gave us complete peace of mind. My son absolutely loves going to school every day!", branch: "Sowcarpet" },
              { name: "Divya Krishnan", text: "The extracurricular activities — especially dance and abacus — have made such a difference. Our daughter is more confident and expressive now.", branch: "Vyasarpadi" },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-lg border-b-4 border-yellow-400 hover:-translate-y-2 transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 font-semibold text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-black text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-gray-800 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 font-bold">{t.branch} Branch</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer id="footer" className="bg-[#ED1C24] text-white pt-28 pb-10 relative">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] -translate-y-[99%] rotate-180">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[90px]" fill="#ED1C24">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,42.47V0Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mb-16">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img src="/logo.png" alt="Little Berries" className="h-20 w-auto mb-6" />
            <p className="text-white/90 font-bold text-base mb-4 italic leading-relaxed">
              "Our goal is to provide a complete nurturing environment for the growth and development of the whole child."
            </p>
            <div className="flex gap-3 mt-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white hover:text-red-600 transition-all hover:-translate-y-1">
                  <Icon size={20} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-black mb-6 text-yellow-400 tracking-wider dosis">QUICK LINKS</h4>
            <ul className="space-y-3 font-bold text-sm">
              {["Home", "About Us", "Programmes", "Infrastructure", "Activities", "Admissions", "Gallery", "Contact"].map(link => (
                <li key={link}><a href="#" className="text-white/80 hover:text-white hover:pl-2 transition-all">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Branches */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-black mb-6 text-yellow-400 tracking-wider dosis">OUR BRANCHES</h4>
            <ul className="space-y-5">
              {locations.map((loc, i) => (
                <li key={i} className="flex flex-col gap-1">
                  <span className="font-black text-yellow-300 text-sm flex items-center gap-1"><MapPin size={14} /> {loc.area}</span>
                  <span className="text-white/80 text-xs font-bold whitespace-pre-line pl-5">{loc.address}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-black mb-6 text-yellow-400 tracking-wider dosis">CONTACT US</h4>
            <ul className="space-y-4 mb-6">
              {["+91-98406 38000", "+91-98407 38000", "+91-97901 77888"].map((num) => (
                <li key={num}>
                  <a href={`tel:${num.replace(/\s/g, "")}`} className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-colors">
                    <Phone size={14} className="text-yellow-400 shrink-0" /> {num}
                  </a>
                </li>
              ))}
              <li>
                <a href="mailto:littleberriesmontessori@gmail.com" className="flex items-start gap-2 text-white/80 hover:text-white font-bold text-xs transition-colors break-all">
                  <Mail size={14} className="text-yellow-400 mt-0.5 shrink-0" /> littleberriesmontessori@gmail.com
                </a>
              </li>
            </ul>
            <div>
              <p className="text-white/70 text-xs font-bold mb-3">Subscribe for updates:</p>
              <div className="flex flex-col gap-2">
                <input type="email" placeholder="Your email..." className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400 transition-all text-sm font-bold" />
                <button className="bg-yellow-400 text-red-700 py-3 rounded-xl font-black text-sm hover:bg-white hover:scale-105 transition-all dosis">SUBSCRIBE</button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-white/10 font-bold text-xs uppercase tracking-[0.2em] opacity-60">
          © {new Date().getFullYear()} Little Berries Montessori. All Rights Reserved. Made with ❤️ for the little ones.
        </div>
      </footer>
    </div>
  );
}
