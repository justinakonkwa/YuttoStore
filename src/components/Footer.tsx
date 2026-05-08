import { Link } from "react-router-dom";
import { Instagram, Twitter, Mail, Facebook } from "lucide-react";
import logo from "@/assets/logo.png";
import { ALL_APP_URL, APP_NAME, APP_PHONE, DEV_EMAIL, PRIVACY_URL, TERMS_URL } from "@/config/app";

export const Footer = () => (
  <footer className="border-t border-border bg-secondary/10 mt-20">
    <div className="container py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
      {/* Marque */}
      <div className="col-span-2">
        <Link to="/" className="inline-flex items-center gap-2 font-serif-display text-3xl">
          <img src={logo} alt={APP_NAME} className="h-9 w-9 object-contain" />
          <span>
            Yutto<span className="text-accent">Store</span>
          </span>
        </Link>
        <p className="text-foreground/55 text-sm mt-4 max-w-xs leading-relaxed">
          Votre marketplace de confiance. Des milliers de produits, livraison rapide et paiements sécurisés.
        </p>
        <p className="text-foreground/45 text-xs mt-3">{APP_PHONE}</p>
        <p className="text-foreground/45 text-xs">{DEV_EMAIL}</p>
        <div className="flex gap-4 mt-6 text-foreground/50">
          <a href={ALL_APP_URL} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-accent transition-smooth">
            <Instagram className="h-4 w-4" />
          </a>
          <a href={ALL_APP_URL} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-accent transition-smooth">
            <Facebook className="h-4 w-4" />
          </a>
          <a href={ALL_APP_URL} target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-accent transition-smooth">
            <Twitter className="h-4 w-4" />
          </a>
          <a href={`mailto:${DEV_EMAIL}`} aria-label="Email" className="hover:text-accent transition-smooth">
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>

      {[
        {
          title: "Boutique",
          links: [
            ["Tous les produits", "/shop"],
            ["Nouveautés", "/shop?sort=newest"],
            ["Meilleures ventes", "/shop?sort=popularity"],
            ["Promotions", "/shop"],
          ],
        },
        {
          title: "Assistance",
          links: [
            ["Centre d'aide", "/"],
            ["Suivre ma commande", "/"],
            ["Retours & remboursements", "/"],
            ["Nous contacter", "/"],
          ],
        },
        {
          title: "À propos",
          links: [
            ["Qui sommes-nous", "/"],
            ["Carrières", "/"],
            ["Politique de confidentialité", PRIVACY_URL],
            ["Conditions d'utilisation", TERMS_URL],
          ],
        },
      ].map((c) => (
        <div key={c.title}>
          <p className="text-sm font-semibold text-foreground mb-4">{c.title}</p>
          <ul className="space-y-2.5">
            {c.links.map(([label, to]) => (
              <li key={label}>
                <a
                  href={to}
                  target={to.startsWith("http") ? "_blank" : undefined}
                  rel={to.startsWith("http") ? "noreferrer" : undefined}
                  className="text-sm text-foreground/50 hover:text-accent transition-smooth"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Barre du bas */}
    <div className="border-t border-border">
      <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/40">
        <p>© {new Date().getFullYear()} YuttoStore. Tous droits réservés.</p>
        <div className="flex items-center gap-4">
          <span>🔒 Connexion SSL sécurisée</span>
          <span>💳 Visa · Mastercard · PayPal</span>
        </div>
      </div>
    </div>
  </footer>
);
