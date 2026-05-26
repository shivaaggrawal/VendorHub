import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "../components/ui/button";

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-8">
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary/80 to-primary/20">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-4 rounded-full shadow-xl">
            <Search className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight mb-4">Page not found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/">
            <Button variant="premium" className="gap-2 h-12 px-8 rounded-full">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="outline" className="h-12 px-8 rounded-full">
              Explore Products
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
