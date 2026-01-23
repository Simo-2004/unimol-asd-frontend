"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Pizza, UtensilsCrossed, ChefHat, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-amber-50 via-orange-50 to-red-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptMCA0djJoLTJ2LTJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 opacity-10 dark:opacity-5">
        <Pizza className="h-32 w-32 text-orange-600 rotate-12" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 dark:opacity-5">
        <UtensilsCrossed className="h-28 w-28 text-red-600 -rotate-12" />
      </div>

      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Logo e titolo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="mb-6 inline-block"
          >
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-orange-400/20 blur-xl" />
              <ChefHat className="relative h-24 w-24 text-orange-600 dark:text-orange-500" />
            </div>
          </motion.div>

          <h1 className="mb-4 font-serif text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-7xl md:text-8xl">
            La Pizzeria
          </h1>
          <div className="mx-auto mb-2 h-1 w-32 rounded-full bg-linear-to-r from-orange-500 via-red-500 to-orange-500" />
          <p className="font-serif text-xl italic text-neutral-600 dark:text-neutral-400 sm:text-2xl">
            Tradizione e sapore dal 1985
          </p>
        </motion.div>

        {/* Descrizione */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 max-w-2xl text-center"
        >
          <p className="mb-6 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
            Benvenuti nel nostro sistema di gestione. Gestisci ordini,
            prenotazioni e menu con semplicità e professionalità.
          </p>

          {/* Features */}
          <div className="mb-8 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-lg border border-orange-200 bg-white/50 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50"
            >
              <Pizza className="mx-auto mb-2 h-8 w-8 text-orange-600 dark:text-orange-500" />
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                Gestione Menu
              </p>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Categorie e prodotti
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="rounded-lg border border-orange-200 bg-white/50 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50"
            >
              <UtensilsCrossed className="mx-auto mb-2 h-8 w-8 text-red-600 dark:text-red-500" />
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                Sala & Tavoli
              </p>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Prenotazioni e gestione
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="rounded-lg border border-orange-200 bg-white/50 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50"
            >
              <ChefHat className="mx-auto mb-2 h-8 w-8 text-amber-600 dark:text-amber-500" />
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                Ordini
              </p>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Tracciamento real-time
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-linear-to-r from-orange-600 to-red-600 px-8 py-6 text-lg font-semibold shadow-xl transition-all hover:shadow-2xl hover:scale-105 dark:from-orange-500 dark:to-red-500"
            >
              <span className="relative z-10 flex items-center gap-2">
                Accedi alla Dashboard
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 z-0 bg-linear-to-r from-orange-500 to-red-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </Button>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center text-sm text-neutral-500 dark:text-neutral-500"
        >
          <p>Sistema di Gestione Pizzeria • Progetto Universitario ASD</p>
          <p className="mt-1 text-xs">Università degli Studi del Molise</p>
        </motion.div>
      </main>
    </div>
  );
}
