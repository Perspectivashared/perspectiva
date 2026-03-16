import logo from "@/assets/logo.png";
import { LANDING_SECTION_IDS, ROUTES } from "@/lib/routes";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-subtle border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to={ROUTES.home} className="flex items-center gap-2">
              <img src={logo} alt="Perspectiva Logo" className="w-10 h-10" />
              <span className="text-xl font-bold text-foreground">
                PERSPECTIVA
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Collaborative research made simple through gamification and
              community.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to={{
                    pathname: ROUTES.home,
                    hash: `#${LANDING_SECTION_IDS.features}`,
                  }}
                  className="hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.communities}
                  className="hover:text-primary transition-colors"
                >
                  Communities
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.profile}
                  className="hover:text-primary transition-colors"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <span className="opacity-70">Pricing (Coming soon)</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="opacity-70">About (Coming soon)</span>
              </li>
              <li>
                <span className="opacity-70">Blog (Coming soon)</span>
              </li>
              <li>
                <span className="opacity-70">Careers (Coming soon)</span>
              </li>
              <li>
                <span className="opacity-70">Contact (Coming soon)</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="opacity-70">Privacy (Coming soon)</span>
              </li>
              <li>
                <span className="opacity-70">Terms (Coming soon)</span>
              </li>
              <li>
                <span className="opacity-70">Security (Coming soon)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>&copy; {year} Perspectiva. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
