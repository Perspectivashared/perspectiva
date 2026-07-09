import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { APP_ROUTES } from "@/app/route-registry";

const DEFAULT_TITLE = "Perspectiva - Gamified Survey Exchange Platform";
const DEFAULT_DESCRIPTION =
  "Join Perspectiva, the gamified survey exchange platform for students and researchers. Earn points by completing surveys, launch your research, and gain insights.";

export const RouteMeta = () => {
  const { pathname } = useLocation();

  const route = APP_ROUTES.find((r) => {
    if (r.path === "*") return false;
    if (r.path.includes(":")) return false;
    return r.path === pathname;
  });

  const title = route?.title ?? DEFAULT_TITLE;
  const description = route?.description ?? DEFAULT_DESCRIPTION;
  const noindex = route?.noindex ?? false;

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (main) {
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
};
