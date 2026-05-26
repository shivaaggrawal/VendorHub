import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Clock, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const AI_SYNONYMS = {
  phone: "smartphones, iPhones, Android phones, mobile accessories",
  mobile: "smartphones, Android phones, iPhones, wireless accessories",
  laptop: "gaming laptops, ultrabooks, notebooks, laptop accessories",
  shoes: "sneakers, running shoes, fashion shoes",
  shoe: "sneakers, running shoes, fashion shoes",
  audio: "headphones, earbuds, studio speakers",
  headphone: "noise-cancelling headphones, earbuds, audio gear",
  watch: "smartwatches, fitness trackers, AI wearables",
  bag: "backpacks, sling bags, laptop carryalls",
  gadget: "AI gadgets, smart devices, futuristic accessories",
};


const TRENDING_SEARCHES = [
  "iPhone 15 Pro",
  "gaming laptop",
  "Android phone",
  "running shoes",
  "AI gadgets",
  "smartwatch",
];

const PLACEHOLDER_PHRASES = [
  "Search phone for smartphones, iPhones, Android...",
  "Search laptop for gaming laptops and ultrabooks...",
  "Search shoes for sneakers and running shoes...",
  "Search AI gadgets for futuristic accessories...",
];

export default function AISearchInput({ isMobile = false }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [synonymMatch, setSynonymMatch] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placeholderText, setPlaceholderText] = useState("");

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);


  useEffect(() => {
    let currentPhraseIdx = 0;
    let currentCharIdx = 0;
    let isDeleting = false;
    let typingTimer;

    const handleType = () => {
      const currentPhrase = PLACEHOLDER_PHRASES[currentPhraseIdx];

      if (!isDeleting) {
        setPlaceholderText(currentPhrase.substring(0, currentCharIdx + 1));
        currentCharIdx++;

        if (currentCharIdx === currentPhrase.length) {

          typingTimer = setTimeout(() => {
            isDeleting = true;
            handleType();
          }, 2000);
          return;
        }
      } else {
        setPlaceholderText(currentPhrase.substring(0, currentCharIdx - 1));
        currentCharIdx--;

        if (currentCharIdx === 0) {
          isDeleting = false;
          currentPhraseIdx = (currentPhraseIdx + 1) % PLACEHOLDER_PHRASES.length;
          typingTimer = setTimeout(handleType, 500);
          return;
        }
      }

      typingTimer = setTimeout(handleType, isDeleting ? 30 : 70);
    };

    handleType();
    return () => clearTimeout(typingTimer);
  }, []);


  useEffect(() => {
    const saved = localStorage.getItem("vendorhub_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);


  useEffect(() => {
    if (!query.trim()) {
      setPredictions([]);
      setSynonymMatch("");
      return;
    }

    const lowerQuery = query.toLowerCase().trim();


    let match = "";
    for (const [key, value] of Object.entries(AI_SYNONYMS)) {
      if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
        match = value;
        break;
      }
    }
    setSynonymMatch(match);


    const baseSuggestions = [
      query,
      match ? match : `${query} premium edition`,
      `${query} designer series`,
    ].filter(Boolean);


    setPredictions([...new Set(baseSuggestions)]);
  }, [query]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !inputRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveSearch = (searchTerm) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("vendorhub_recent_searches", JSON.stringify(updated));
  };

  const performSearch = (searchTerm) => {
    saveSearch(searchTerm);
    setQuery("");
    setIsFocused(false);
    navigate(`/explore?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeIndex >= 0) {

      if (predictions[activeIndex]) {
        performSearch(predictions[activeIndex]);
      }
    } else if (synonymMatch) {
      performSearch(synonymMatch);
    } else if (query.trim()) {
      performSearch(query);
    }
  };

  const handleKeyDown = (e) => {
    if (!isFocused) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  const removeRecentSearch = (e, term) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem("vendorhub_recent_searches", JSON.stringify(updated));
  };

  return (
    <div className={`relative ${isMobile ? "w-full" : "w-full"}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative group">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholderText}
            onKeyDown={handleKeyDown}
            className={`w-full ${
              isMobile ? "h-9 pl-9 pr-4 text-xs rounded-full" : "h-10 pl-10 pr-24 text-sm rounded-xl"
            } bg-card/60 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#e1dcc9]/30 focus:border-[#e1dcc9]/40 focus:bg-black shadow-premium focus:shadow-glow-gold transition-all`}
          />
          {!isMobile && (
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 rounded-lg bg-[#412d15] text-[#e1dcc9] border border-[#e1dcc9]/10 text-xs font-semibold hover:bg-[#e1dcc9] hover:text-black transition-all duration-300 flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e1dcc9]" />
              <span>AI Search</span>
            </button>
          )}
        </div>
      </form>


      <AnimatePresence>
        {isFocused && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full mt-2 max-h-[360px] overflow-y-auto rounded-xl border border-border bg-[#1f150c]/95 backdrop-blur-2xl p-4 shadow-premium-hover z-50"
          >

            {synonymMatch && (
              <div className="mb-3.5 p-3 rounded-lg bg-[#412d15]/50 border border-[#e1dcc9]/10 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#e1dcc9] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium leading-none">AI Synonym Recommendation</p>
                  <p className="text-sm font-semibold text-[#e1dcc9] mt-1.5">
                    Suggested query: <span className="underline italic decoration-[#e1dcc9]/30 cursor-pointer" onClick={() => performSearch(synonymMatch)}>"{synonymMatch}"</span>
                  </p>
                </div>
              </div>
            )}


            {query.trim().length > 0 ? (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mb-1.5 px-2">AI Search Suggestions</p>
                {predictions.map((pred, idx) => (
                  <button
                    key={pred}
                    onClick={() => performSearch(pred)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-all ${
                      idx === activeIndex
                        ? "bg-[#412d15] text-[#e1dcc9] shadow-sm pl-4"
                        : "text-muted-foreground hover:bg-[#412d15]/30 hover:text-foreground"
                    }`}
                  >
                    <span>{pred}</span>
                    {idx === activeIndex && <Sparkles className="w-3.5 h-3.5 text-[#e1dcc9] animate-pulse" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">

                {recentSearches.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mb-2 px-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>Recent Searches</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term) => (
                        <div
                          key={term}
                          onClick={() => performSearch(term)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#412d15]/30 hover:bg-[#412d15]/75 border border-[#412d15] text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        >
                          <span>{term}</span>
                          <button
                            onClick={(e) => removeRecentSearch(e, term)}
                            className="h-3.5 w-3.5 rounded-full hover:bg-muted/35 flex items-center justify-center shrink-0"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                <div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mb-2 px-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-[#e1dcc9]" />
                    <span>Trending Near You</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {TRENDING_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => performSearch(term)}
                        className="px-3 py-1 rounded-full bg-[#412d15]/20 hover:bg-[#412d15]/60 border border-border/50 text-xs text-[#e1dcc9]/80 hover:text-foreground transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
