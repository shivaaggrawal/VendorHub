import { Link } from "react-router-dom";
import { Mail, ArrowUpRight, ShieldCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const marketplaceLinks = [
  { label: "Explore Products", to: "/explore" },
  { label: "Categories", to: "/categories" },
  { label: "Flash Deals", to: "/explore?deals=flash" },
  { label: "New Arrivals", to: "/explore?sort=newest" },
  { label: "Top Sellers", to: "/sellers" },
];

const sellerLinks = [
  { label: "Start Selling", to: "/register" },
  { label: "Seller Dashboard", to: "/seller/dashboard" },
  { label: "Seller Guidelines", to: "/seller-guidelines" },
  { label: "Pricing & Fees", to: "/pricing" },
  { label: "Success Stories", to: "/success-stories" },
];

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy" },
];

const socialLinks = [
  { label: "Twitter", icon: TwitterIcon, href: "https://x.com" },
  { label: "Instagram", icon: InstagramIcon, href: "https://instagram.com" },
  { label: "LinkedIn", icon: LinkedinIcon, href: "https://linkedin.com" },
  { label: "GitHub", icon: GithubIcon, href: "https://github.com" },
];




const FooterColumn = ({ title, links }) => (
  <div className="flex flex-col gap-6">
    <div className="relative">
      <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#e1dcc9]/90 font-oswald">
        {title}
      </h3>
      <div className="absolute -bottom-2 left-0 w-8 h-[1px] bg-gradient-to-r from-[#e1dcc9]/40 to-transparent" />
    </div>
    <ul className="space-y-3.5 mt-2">
      {links.map(({ label, to }) => (
        <li key={label}>
          <Link
            to={to}
            className="group inline-flex items-center gap-1.5 text-xs text-[#e1dcc9]/50 hover:text-[#e1dcc9] transition-all duration-300 transform hover:translate-x-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#e1dcc9]/0 group-hover:bg-[#e1dcc9]/40 scale-0 group-hover:scale-100 transition-all duration-300" />
            {label}
            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#e1dcc9]/80" />
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="relative border-t border-[#412d15]/30 bg-black overflow-hidden select-none">

      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#e1dcc9]/20 to-transparent" />
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        className="absolute top-0 left-0 w-72 h-[1.5px] bg-gradient-to-r from-transparent via-[#e1dcc9]/60 to-transparent blur-[0.5px]"
      />


      <div className="absolute inset-0 bg-gradient-mesh opacity-65 pointer-events-none" />


      <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#412d15]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-48 -right-20 w-[450px] h-[450px] bg-[#e1dcc9]/2 rounded-full blur-[140px] pointer-events-none" />


      <svg className="absolute right-0 bottom-0 w-96 h-96 text-[#e1dcc9]/2 pointer-events-none" viewBox="0 0 100 100">
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 3" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="6 2" />
        <line x1="20" y1="100" x2="100" y2="100" stroke="currentColor" strokeWidth="0.1" />
        <line x1="100" y1="20" x2="100" y2="100" stroke="currentColor" strokeWidth="0.1" />
      </svg>

      <div className="container mx-auto px-4 md:px-8 py-20 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">

          <div className="md:col-span-4 flex flex-col gap-6">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <span className="text-xl font-black tracking-[0.2em] text-[#e1dcc9] font-oswald uppercase">
                VENDOR<span className="font-light text-[#e1dcc9]/70 tracking-[0.1em]">HUB</span>
              </span>
            </Link>

            <p className="text-xs text-[#e1dcc9]/50 leading-relaxed max-w-xs font-light">
              An artificial luxury node connecting prestigious designers, global curators, and discerning buyers across a highly secure, cinematic multi-vendor web experience.
            </p>


            <div className="flex flex-col gap-3 mt-2">
              <div className="relative">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#e1dcc9]/80 font-oswald">
                  Subscribe to the Frontier
                </h4>
                <div className="absolute -bottom-1.5 left-0 w-6 h-[1px] bg-[#e1dcc9]/30" />
              </div>
              <p className="text-[11px] text-[#e1dcc9]/40 mt-1">
                Receive private curations and AI-powered collection alerts.
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center gap-2 mt-2"
              >
                <div className="relative flex-1 group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1dcc9]/30 group-focus-within:text-[#e1dcc9]/70 transition-colors" />
                  <input
                    type="email"
                    placeholder="ENTER PRIVATE EMAIL"
                    className="w-full h-10 pl-10 pr-4 bg-[#1f150c]/40 border border-[#412d15]/60 rounded-xl text-xs text-[#e1dcc9] placeholder:text-[#e1dcc9]/30 focus:outline-none focus:border-[#e1dcc9]/50 focus:ring-1 focus:ring-[#e1dcc9]/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] focus:shadow-[0_0_15px_rgba(225,220,201,0.06)] transition-all duration-300 font-sans tracking-wide"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 18px rgba(225,220,201,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#e1dcc9] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all duration-300 shrink-0 font-oswald"
                >
                  Join
                </motion.button>
              </form>
            </div>
          </div>


          <div className="hidden lg:block lg:col-span-1" />


          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <FooterColumn title="Marketplace" links={marketplaceLinks} />
            <FooterColumn title="For Sellers" links={sellerLinks} />
            <FooterColumn title="Company" links={companyLinks} />
          </div>
        </div>


        <div className="mt-20 pt-10 border-t border-[#412d15]/20 relative">

          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-black text-[#e1dcc9]/10 font-black text-[9px] tracking-[0.4em] uppercase font-oswald select-none">
            INTELLIGENCE LAYER ACTIVE
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <p className="text-[11px] text-[#e1dcc9]/35 font-light tracking-wide">
                &copy; {new Date().getFullYear()} VendorHub. Crafted for the global elite.
              </p>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#412d15]" />
              <span className="inline-flex items-center gap-1.5 text-[10px] text-[#e1dcc9]/40 tracking-wider font-light">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e1dcc9]/40" />
                SECURE END-TO-END TLS
              </span>
            </div>


            <div className="flex items-center gap-3">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <motion.a
                  whileHover={{ y: -3, scale: 1.08, borderColor: "rgba(225,220,201,0.5)", backgroundColor: "rgba(225,220,201,0.06)", boxShadow: "0 0 10px rgba(225,220,201,0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center h-10 w-10 rounded-full border border-[#412d15]/60 text-[#e1dcc9]/60 hover:text-[#e1dcc9] transition-all duration-300 bg-black/40"
                >
                  <Icon className="w-4.5 h-4.5" />
                </motion.a>
              ))}
            </div>
          </div>


          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[10px] text-[#e1dcc9]/30 tracking-widest font-light uppercase">
            <Link to="/about" className="hover:text-[#e1dcc9] transition-colors duration-300">TERMS OF CURATION</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#e1dcc9] transition-colors duration-300">PRIVACY PROTOCOL</Link>
            <span>•</span>
            <Link to="/seller-guidelines" className="hover:text-[#e1dcc9] transition-colors duration-300">COMPLIANCE STRATEGY</Link>
            <span>•</span>
            <a href="#" className="inline-flex items-center gap-1 hover:text-[#e1dcc9] transition-colors duration-300">
              CORE SYSTEM STATUS
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
