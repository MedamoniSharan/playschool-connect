import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  School,
  Users,
  Award,
  ToyBrick,
  Palette,
  Puzzle,
  PartyPopper,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Star,
  Cloud,
  Sun,
  Menu,
  X,
  Sparkles,
  Heart,
  Music,
  Tent,
  Monitor,
  Video
} from "lucide-react";

const CloudDivider = ({ color = "#FFD700", flip = false }: { color?: string; flip?: boolean }) => (
  <div className={`w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''}`}>
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="relative block w-full h-[80px]"
      fill={color}
    >
      <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,42.47V0Z" opacity=".25"></path>
      <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,104.5,20.85,35.74,12.15,72,25.2,110.1,30,68.9,8.73,137.64-12,197-47,56-33,126-10,186,18,33,15,66.86,30.34,103.87,35,46,5.81,93.43-15.17,133.43-41V0Z" opacity=".5"></path>
      <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.41,78.3,34.19,158.25,48.13,243.4,26,71-18.45,133.45-56,187.6-97.53V0Z"></path>
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
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={40} style={{ color }} />
      </div>
    </div>
    <h3 className="text-2xl font-black mb-4" style={{ color }}>{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed font-semibold">{description}</p>
    <div className="mt-8 flex justify-center">
      <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all hover:rotate-12 hover:scale-110" style={{ backgroundColor: color }}>
        <ChevronRight size={24} />
      </button>
    </div>
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#hero", color: "#28a745" },
    { name: "About", href: "#why", color: "#e83e8c" },
    { name: "Courses", href: "#courses", color: "#17a2b8" },
    { name: "Infrastructure", href: "#infrastructure", color: "#ffc107" },
    { name: "Admissions", href: "#admissions", color: "#fd7e14" },
    { name: "Gallery", href: "#gallery", color: "#007bff" },
    { name: "Franchise", href: "#franchise", color: "#6610f2" },
    { name: "Contact", href: "#footer", color: "#6f42c1" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-yellow-200 overflow-x-hidden">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .hero-pattern {
          background-image: radial-gradient(#ffffff 2px, transparent 2px);
          background-size: 30px 30px;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[100] h-24 flex items-center justify-center border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="relative">
                <div className="absolute -inset-2 bg-yellow-400 rounded-full blur opacity-40 group-hover:opacity-100 transition-opacity" />
                <img src="/logo.png" alt="Little Berries Logo" className="relative h-16 w-auto object-contain transition-transform group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-3xl font-black italic tracking-tight" style={{ color: "#ED1C24", textShadow: "2px 2px 0px #FFD700" }}>LITTLE BERRIES</h1>
              <span className="text-xs font-black text-[#0056B3] tracking-widest uppercase">The Joy of Learning</span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[15px] font-black transition-all hover:scale-110 hover:-translate-y-1 block py-2"
                style={{ color: link.color }}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="bg-[#ED1C24] text-white px-8 py-3.5 rounded-[2rem] font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_6px_0_0_#9a1217] hover:shadow-[0_4px_0_0_#9a1217] hover:translate-y-[2px]"
            >
              LOGIN
            </button>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-3 rounded-2xl bg-gray-100 text-gray-800 hover:bg-yellow-400 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 top-24 bg-white z-[90] xl:hidden overflow-y-auto animate-fade-in">
            <div className="p-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-black text-center border-b-4 border-gray-50 pb-4 last:border-0"
                  style={{ color: link.color }}
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={() => { setIsMenuOpen(false); navigate("/login"); }}
                className="bg-[#ED1C24] text-white w-full py-6 rounded-[2.5rem] font-black text-2xl mt-4 shadow-[0_10px_0_0_#9a1217]"
              >
                PARENT LOGIN
              </button>
            </div>
          </div>
        )}
      </nav>

      <section id="hero" className="relative min-h-[750px] flex items-center overflow-hidden bg-sky-400 hero-pattern pt-24 lg:pt-0">
        <Doodle icon={Star} className="top-20 left-[10%]" color="#FFD700" size={48} />
        <Doodle icon={Cloud} className="top-40 right-[15%]" color="#FFFFFF" size={80} />
        <Doodle icon={Sun} className="bottom-20 left-[20%] animate-pulse" color="#FFD700" size={100} />
        <Doodle icon={Puzzle} className="top-[50%] left-[5%]" color="#4834d4" size={56} />

        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <div className="text-left animate-fade-in-up">
            <div className="inline-block bg-yellow-400 text-[#0056B3] px-6 py-2 rounded-full font-black text-sm mb-6 shadow-lg rotate-[-2deg]">
              PRESCHOOL OF CHAMPIONS
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 drop-shadow-2xl">
              Play, Learn <br />
              <span className="text-yellow-400">& Grow</span> <br />
              Together!
            </h2>
            <p className="text-white text-xl md:text-2xl font-bold mb-10 max-w-lg leading-relaxed drop-shadow-md">
              Discover a world of magic, friendship, and endless curiosity. Every child is a superstar at Little Berries!
            </p>
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => navigate("/login")}
                className="bg-white text-red-600 px-12 py-5 rounded-[2.5rem] font-black text-xl hover:scale-105 transition-all shadow-[0_10px_0_0_#ddd] active:translate-y-2 active:shadow-none"
              >
                ENROLL NOW
              </button>
              <a href="#courses" className="bg-[#0056B3] text-white px-12 py-5 rounded-[2.5rem] font-black text-xl hover:scale-105 transition-all shadow-[0_10px_0_0_#003c7e] active:translate-y-2 active:shadow-none flex items-center justify-center">
                EXPLORE
              </a>
            </div>
          </div>

          <div className="relative group flex justify-center lg:justify-end">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all" />
            <img 
              src="https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=1000" 
              alt="Happy Kids" 
              className="relative w-full max-w-md rounded-[4rem] border-8 border-white shadow-2xl rotate-3 transition-transform group-hover:rotate-0"
            />
          </div>
        </div>
      </section>

      <CloudDivider />

      <section id="why" className="py-32 bg-white relative overflow-hidden">
        <Doodle icon={Palette} className="top-10 right-10" color="#e83e8c" size={64} />
        <Doodle icon={ToyBrick} className="bottom-10 left-10" color="#17a2b8" size={64} />
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-32 relative">
            <div className="inline-block bg-pink-100 text-pink-600 px-8 py-2 rounded-full font-black text-sm mb-4 uppercase tracking-wider">
              NURTURING GENIUS
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-[#0056B3] mb-6 tracking-tight">Why Choose Little Berries?</h2>
            <div className="flex justify-center gap-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full ${['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400', 'bg-pink-400'][i]}`} />
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={ToyBrick}
              color="#e83e8c"
              title="Creative Play"
              description="Building dreams block by block with our unique Prismart magic toolkits and creative zones."
            />
            <FeatureCard 
              icon={Palette}
              color="#28a745"
              title="Speak-O-Pen"
              description="Magical books that talk! Transform story time into a speaking adventure that children love."
            />
            <FeatureCard 
              icon={Puzzle}
              color="#fd7e14"
              title="Smart Class"
              description="Digital smart classes that make learning as fun as watching their favorite cartoons!"
            />
            <FeatureCard 
              icon={PartyPopper}
              color="#6f42c1"
              title="AR Superstars"
              description="Step into the future with AR and VR classes that bring the entire world to your room!"
            />
          </div>
        </div>
      </section>

      <section id="courses" className="py-32 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black text-red-600 mb-6 drop-shadow-sm">Our Berry Courses</h2>
            <p className="text-gray-500 font-bold max-w-2xl mx-auto italic">Specially designed programs for different age groups to ensure holistic development.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Toddlers", age: "1.5 - 2 Years", color: "#28a745", icon: Heart },
              { name: "Nursery", age: "2 - 3 Years", color: "#e83e8c", icon: Music },
              { name: "LKG", age: "3 - 4 Years", color: "#17a2b8", icon: Palette },
              { name: "UKG", age: "4 - 5 Years", color: "#6f42c1", icon: Award },
            ].map((course, idx) => (
              <div key={idx} className="bg-white rounded-[3rem] p-10 shadow-xl border-b-8 transition-transform hover:-translate-y-4" style={{ borderColor: course.color }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${course.color}15` }}>
                  <course.icon size={32} style={{ color: course.color }} />
                </div>
                <h4 className="text-3xl font-black mb-2" style={{ color: course.color }}>{course.name}</h4>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">{course.age}</p>
                <ul className="space-y-3 mb-8">
                  {["Phonetic Skills", "Motor Coordination", "Social Etiquettes"].map(skill => (
                    <li key={skill} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <Sparkles size={14} className="text-yellow-400" /> {skill}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-4 rounded-2xl font-black text-white shadow-lg" style={{ backgroundColor: course.color }}>DETAILS</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className="bg-yellow-400 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center relative z-10">
          {[
            { label: "Fun Schools", count: "1200+", color: "#ED1C24" },
            { label: "Happy Buddies", count: "500k+", color: "#0056B3" },
            { label: "Super Teachers", count: "5000+", color: "#28a745" },
            { label: "Cool Awards", count: "50+", color: "#6f42c1" },
          ].map((stat, i) => (
            <div key={i} className="group cursor-default">
              <div className="text-5xl md:text-7xl font-black mb-2 transition-transform group-hover:scale-125 select-none" style={{ color: stat.color }}>{stat.count}</div>
              <div className="text-lg font-black text-gray-800 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </section>

      <section id="infrastructure" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-yellow-400 rounded-[4rem] rotate-3 -z-10 opacity-20 group-hover:rotate-0 transition-transform" />
                <img 
                  src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=1000" 
                  alt="School Infrastructure" 
                  className="rounded-[3rem] shadow-2xl w-full h-[500px] object-cover"
                />
              </div>
              <div className="space-y-8">
                <h2 className="text-6xl font-black text-[#0056B3] leading-tight">World Class <br /><span className="text-red-600">Infrastructure</span></h2>
                <p className="text-xl text-gray-600 font-bold leading-relaxed">We provide a safe, sanitized, and playful environment with all modern educational amenities.</p>
                <div className="grid grid-cols-2 gap-6 pb-8">
                  {[
                    { text: "Smart Play Zone", icon: Tent, bg: "bg-green-100", color: "text-green-600" },
                    { text: "Digital Lab", icon: Monitor, bg: "bg-blue-100", color: "text-blue-600" },
                    { text: "Safe Cams", icon: Video, bg: "bg-red-100", color: "text-red-600" },
                    { text: "Green Area", icon: Heart, bg: "bg-pink-100", color: "text-pink-600" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center`}>
                        <item.icon size={24} />
                      </div>
                      <span className="font-black text-gray-800 tracking-tight">{item.text}</span>
                    </div>
                  ))}
                </div>
                <button className="bg-red-600 text-white px-12 py-5 rounded-[2.5rem] font-black text-xl shadow-xl hover:scale-105 transition-all">VIEW FACILITIES</button>
              </div>
           </div>
        </div>
      </section>

      <section id="admissions" className="py-24 bg-sky-400 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white text-center mb-20 italic">Join the Berry Club!</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Apply Online", color: "#28a745" },
              { step: "02", title: "School Tour", color: "#fd7e14" },
              { step: "03", title: "Join Hands", color: "#ED1C24" },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-10 rounded-[3rem] text-center border-4 border-white/20 hover:bg-white transition-all group">
                <div className="text-6xl font-black text-white/40 mb-4 group-hover:text-sky-400 transition-colors">{item.step}</div>
                <h4 className="text-3xl font-black text-white group-hover:text-[#0056B3] transition-colors">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>
        <Doodle icon={Star} className="top-10 left-10" color="white" size={100} />
        <Doodle icon={Cloud} className="bottom-10 right-10" color="white" size={150} />
      </section>

      <section id="gallery" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black text-[#0056B3] mb-4">Our Happy Moments</h2>
            <div className="w-32 h-2 bg-yellow-400 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
            {[
              "1502086223501-7ea244b05ec6",
              "1544367567-0f2fcb009e0b",
              "1596464716127-f2a82984de30",
              "1488521787991-ed7bbaae773c"
            ].map((id, i) => (
              <img key={i} src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=500`} className="rounded-3xl w-full h-[300px] object-cover hover:scale-105 transition-transform cursor-pointer shadow-lg" />
            ))}
          </div>
        </div>
      </section>

      <section id="franchise" className="py-32 bg-red-600 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">Start Your Own <br /> Little Berries!</h2>
          <p className="text-white/80 text-xl font-bold mb-12 italic">Be a part of the fastest growing preschool chain in India.</p>
          <button className="bg-white text-red-600 px-16 py-6 rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all">INQUIRE NOW</button>
        </div>
        <div className="absolute inset-0 bg-white/5 [mask-image:radial-gradient(circle,white_20%,transparent_80%)]" />
      </section>

      <section id="initiatives" className="py-32 bg-gray-50 overflow-hidden relative">
        <Doodle icon={Cloud} className="top-0 left-0" color="#0056B3" size={120} />
        <Doodle icon={Star} className="bottom-0 right-0" color="#FFD700" size={120} />

        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-[#0056B3] mb-4 italic">The Big Berries Family</h2>
            <p className="text-gray-500 font-bold">Leading the way in happy education</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Academic Heights", color: "#ED1C24", desc: "Our big-school sisters for when toddlers grow into giants!" },
              { title: "Prismart E-Tools", color: "#0056B3", desc: "Magic inventors of our talking pens and magic boxes." },
              { title: "Berry University", color: "#28a745", desc: "Where the smartest teachers learn how to make you smile." }
            ].map((init, i) => (
              <div key={i} className="bg-white p-12 rounded-[3rem] shadow-xl border-t-[16px] transition-all hover:-translate-y-4 hover:rotate-2 group" style={{ borderTopColor: init.color }}>
                <h4 className="text-3xl font-black mb-6 group-hover:scale-105 transition-transform" style={{ color: init.color }}>{init.title}</h4>
                <p className="text-gray-600 font-bold leading-relaxed">{init.desc}</p>
                <div className="mt-8 flex justify-end">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: init.color }}>
                        <ChevronRight />
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="footer" className="bg-[#ED1C24] text-white pt-32 pb-12 relative">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] -translate-y-[99%] rotate-180">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[100px]" fill="#ED1C24">
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,42.47V0Z"></path>
            </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img src="/logo.png" alt="Little Berries" className="h-24 w-auto mb-8" />
            <p className="text-white/90 font-black text-lg mb-8 italic">Where learning is like eating candy - sweet and fun!</p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white hover:text-red-600 transition-all hover:-translate-y-2">
                  <Icon size={24} strokeWidth={3} />
                </a>
              ))}
            </div>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-2xl font-black mb-8 text-yellow-400 tracking-wider">FUN PLACES</h4>
            <ul className="space-y-4 font-black">
              {["Our Home", "Story Time", "Toy Room", "Magic Art", "Admissions", "Say Hi!"].map(link => (
                <li key={link}><a href="#" className="text-white/80 hover:text-white hover:pl-2 transition-all">{link}</a></li>
              ))}
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-2xl font-black mb-8 text-yellow-400 tracking-wider">FIND US</h4>
            <ul className="space-y-6 font-black">
              <li className="flex flex-col items-center md:items-start gap-2">
                <MapPin className="text-yellow-400" />
                <span>Madhapur, Hyderabad, TS</span>
              </li>
              <li className="flex flex-col items-center md:items-start gap-2">
                <Phone className="text-yellow-400" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-2xl font-black mb-8 text-yellow-400 tracking-wider">JOIN THE CLUB</h4>
            <p className="text-white/80 mb-6 font-bold">Get fun magic tricks in your email!</p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Naughty email here..." 
                className="bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400 transition-all font-bold"
              />
              <button className="bg-yellow-400 text-red-600 py-4 rounded-2xl font-black text-xl hover:bg-white hover:scale-105 active:scale-100 transition-all shadow-lg">
                YAY!
              </button>
            </div>
          </div>
        </div>
        <div className="text-center pt-12 border-t border-white/10 font-black text-sm uppercase tracking-[0.3em] opacity-60">
          Made with ❤️ for the little ones
        </div>
      </footer>
    </div>
  );
}
