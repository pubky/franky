import Link from 'next/link';
import { Twitter, Youtube, Github, Mail, ExternalLink } from 'lucide-react';
import { Logo } from '@/components/ui';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="container mx-auto px-6 py-12 max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs mt-2">
              Take control of your digital identity with cryptographic keys you own and control.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/getpubky"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-all"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCyNruUjynpzvQXNTxbJBLmg"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-all"
                aria-label="Watch us on YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/pubky"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-all"
                aria-label="View our code on GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Product</h3>
            <nav className="flex flex-col space-y-3">
              <Link
                href="/onboarding"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Get started
              </Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
              <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help & Support
              </Link>
              <a
                href="https://github.com/pubky/franky/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Releases
                <ExternalLink className="w-3 h-3" />
              </a>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Resources</h3>
            <nav className="flex flex-col space-y-3">
              <a
                href="https://pubky.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Pubky Protocol
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://github.com/pubky"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Open Source
                <ExternalLink className="w-3 h-3" />
              </a>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Contact</h3>
            <nav className="flex flex-col space-y-3">
              <a
                href="mailto:hello@synonym.to"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                hello@synonym.to
              </a>
              <a
                href="https://synonym.to"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Synonym.to
                <ExternalLink className="w-3 h-3" />
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Synonym Software Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Built with ❤️ for digital freedom</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
