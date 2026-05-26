import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import Loader from "../components/Loader";






export function useDelayedLoader(loading, { delay = 300, minimumShowTime = 500 } = {}) {
  const [showLoader, setShowLoader] = useState(false);
  const delayTimerRef = useRef(null);
  const minShowTimerRef = useRef(null);
  const showTimeRef = useRef(0);

  useEffect(() => {
    if (loading) {

      if (minShowTimerRef.current) {
        clearTimeout(minShowTimerRef.current);
        minShowTimerRef.current = null;
      }


      if (!showLoader && !delayTimerRef.current) {
        delayTimerRef.current = setTimeout(() => {
          setShowLoader(true);
          showTimeRef.current = Date.now();
          delayTimerRef.current = null;
        }, delay);
      }
    } else {

      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }


      if (showLoader) {
        const elapsed = Date.now() - showTimeRef.current;
        const remaining = minimumShowTime - elapsed;

        if (remaining > 0) {
          if (!minShowTimerRef.current) {
            minShowTimerRef.current = setTimeout(() => {
              setShowLoader(false);
              minShowTimerRef.current = null;
            }, remaining);
          }
        } else {
          setShowLoader(false);
        }
      }
    }

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (minShowTimerRef.current) clearTimeout(minShowTimerRef.current);
    };
  }, [loading, showLoader, delay, minimumShowTime]);

  return showLoader;
}





export function useLoading(asyncFunction, { defaultError = "An error occurred." } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (...args) => {

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {

      const result = await asyncFunction(...args, { signal: controller.signal });
      setData(result);
      return result;
    } catch (err) {
      if (err.name === "AbortError" || err.message === "canceled" || controller.signal.aborted) {

        return;
      }
      const msg = err.response?.data?.message || err.message || defaultError;
      setError(msg);
      throw err;
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [asyncFunction, defaultError]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { loading, error, data, execute, setError, setData };
}





export function LoaderWrapper({
  loading,
  children,
  fallback,
  fullScreen = false,
  delay = 300,
  minimumShowTime = 500,
  text = "Synchronizing layers...",
  subtitle = "CORE QUANTUM ENGINE",
  minHeight = "200px",
  preserveLayout = true,
}) {
  const showLoader = useDelayedLoader(loading, { delay, minimumShowTime });

  if (showLoader) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (fullScreen) {
      return <Loader fullScreen={true} text={text} subtitle={subtitle} />;
    }

    if (preserveLayout && children) {
      return (
        <div className="relative w-full overflow-hidden" style={{ minHeight }}>
          <div className="pointer-events-none opacity-40 blur-[2px] filter select-none transition-all duration-500">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-30 transition-all duration-300">
            <Loader fullScreen={false} text={text} subtitle={subtitle} />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full flex items-center justify-center" style={{ minHeight }}>
        <Loader fullScreen={false} text={text} subtitle={subtitle} />
      </div>
    );
  }

  return <>{children}</>;
}

export function DelayedSuspenseFallback({ text = "Opening boutique gateway...", subtitle = "VENDORHUB SYSTEM CORE", fullScreen = true }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return <Loader fullScreen={fullScreen} text={text} subtitle={subtitle} />;
}

export function GlobalTopBarLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const activeCount = isFetching + isMutating;
  const showLoader = useDelayedLoader(activeCount > 0, { delay: 300, minimumShowTime: 400 });

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-[#412d15] via-[#e1dcc9] to-[#412d15] z-[9999] top-bar-loader-glow"
        />
      )}
    </AnimatePresence>
  );
}

export function SmartImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  aspectRatio = "aspect-[3/4]",
  fallback = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80",
  ...props
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setImageLoaded(true);
  };

  const finalSrc = error ? fallback : src;

  return (
    <div className={`relative overflow-hidden ${aspectRatio} bg-[#1f150c] ${containerClassName}`}>
      <AnimatePresence>
        {!imageLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 skeleton z-10"
          />
        )}
      </AnimatePresence>
      <img
        src={finalSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} transition-opacity duration-700 ease-out ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        {...props}
      />
    </div>
  );
}
