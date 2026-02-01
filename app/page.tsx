import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Pricing } from "@/components/pricing";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Pricing />
        <section
          id="contact"
          className="px-4 py-20 md:py-28 md:px-6"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="mb-12 text-center md:mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Get in touch
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Have a question or feedback? Send us a message.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
