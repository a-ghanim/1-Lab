import { motion } from "framer-motion";
import { FileText, MessageSquare, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden dot-grid">
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary" />
          <span className="font-semibold text-lg">One Breath Lab</span>
        </div>

        <Button 
          onClick={handleLogin}
          className="btn-primary"
          data-testid="button-login-header"
        >
          Sign in
        </Button>
      </header>

      <main className="relative z-10 px-6 md:px-12 lg:px-20 pt-20 md:pt-28 lg:pt-36 pb-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <p className="text-sm text-muted-foreground tracking-wide">
              research assistant
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-tight">
              your documents,
              <br />
              understand them deeply,
              <br />
              learn from AI insights.
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Upload your research papers, notes, and documents. Chat with AI that understands your sources and generates study materials.
            </p>

            <div className="pt-4">
              <Button 
                onClick={handleLogin}
                className="btn-primary text-base px-6 py-3 h-auto"
                data-testid="button-get-started"
              >
                get started
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 max-w-5xl"
        >
          <div className="bg-card border border-border p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: FileText,
                  title: "Upload Sources",
                  description: "Add documents, paste text, or import URLs to build your research base"
                },
                {
                  icon: MessageSquare,
                  title: "Chat with AI",
                  description: "Ask questions and get answers grounded in your uploaded sources"
                },
                {
                  icon: BookOpen,
                  title: "Generate Courses",
                  description: "Create structured learning paths from any topic with AI"
                }
              ].map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="space-y-3"
                >
                  <feature.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                  <h3 className="text-base font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-32 max-w-2xl"
        >
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-medium">
              Ready to start learning?
            </h2>
            <p className="text-muted-foreground">
              Join researchers and learners using AI to understand their documents faster.
            </p>
            <Button 
              onClick={handleLogin}
              className="btn-primary"
              data-testid="button-signup-cta"
            >
              Create account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.section>
      </main>

      <footer className="relative z-10 border-t border-border py-8 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} One Breath Lab</p>
        </div>
      </footer>
    </div>
  );
}
