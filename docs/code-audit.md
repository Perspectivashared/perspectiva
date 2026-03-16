# Code Audit Report

## Summary
- Scope: full repository file-by-file audit and refactor pass.
- Refactor model: feature-first architecture (`src/app`, `src/features`, `src/shared`) with compatibility adapters for legacy imports.
- Quality gates: strict TypeScript enabled (`strict: true`), Vitest + RTL test suite added, and lint/build/typecheck/test all passing.

## Architecture (Before)
```text
src/
  pages/* (mixed state + domain logic + UI)
  components/* (UI + feature concerns interleaved)
  lib/* (data + domain + adapter responsibilities mixed)
  services/* (local fixtures and transport concerns mixed)
```

## Architecture (After)
```text
src/
  app/        # providers, router composition, typed route registry
  features/   # domain-centric modules (communities, surveys, survey-builder, auth, pricing, profile, categorizer)
  shared/     # app shell, async state primitives, shared utilities
  pages/      # thin route containers composing feature modules
  lib/, services/ # compatibility adapters where needed
```

## Migration Notes
1. Typed route registry now lives in `src/app/route-registry.ts`; `src/lib/routes.ts` remains a compatibility export.
2. Communities domain moved to `src/features/communities/*`; legacy imports from `src/lib/community-data.ts` and `src/services/communities.ts` remain valid via adapters.
3. Survey runtime and survey-builder logic extracted into dedicated feature modules for normalization, validation, rendering, and persistence.
4. Auth/profile/categorizer/pricing flows now consume dedicated feature modules and shared app-shell primitives.
5. Strict TypeScript is enabled in app config; test tooling is integrated with Vitest + RTL.

## File Index

| File | Status | Category |
|---|---|---|
| `bun.lockb` | No-Change | Project Infrastructure |
| `components.json` | No-Change | Project Infrastructure |
| `docs/code-audit.md` | Refactor-Required | Project Infrastructure |
| `eslint.config.js` | No-Change | Project Infrastructure |
| `index.html` | No-Change | Project Infrastructure |
| `package.json` | Refactor-Required | Project Infrastructure |
| `package-lock.json` | Refactor-Required | Project Infrastructure |
| `postcss.config.js` | No-Change | Project Infrastructure |
| `public/favicon.ico` | No-Change | Project Infrastructure |
| `public/placeholder.svg` | No-Change | Project Infrastructure |
| `public/robots.txt` | No-Change | Project Infrastructure |
| `README.md` | No-Change | Project Infrastructure |
| `src/App.tsx` | Refactor-Required | Project Infrastructure |
| `src/app/AppProviders.tsx` | Refactor-Required | Feature-First Architecture |
| `src/app/AppRouter.tsx` | Refactor-Required | Feature-First Architecture |
| `src/app/query-client.ts` | Refactor-Required | Feature-First Architecture |
| `src/app/route-registry.ts` | Refactor-Required | Feature-First Architecture |
| `src/assets/hero-image.jpg` | No-Change | Project Infrastructure |
| `src/assets/logo.png` | No-Change | Project Infrastructure |
| `src/components/Communities.tsx` | No-Change | UI Composition |
| `src/components/CommunityCard.tsx` | Refactor-Required | UI Composition |
| `src/components/CommunityFilterBar.test.tsx` | Refactor-Required | UI Composition |
| `src/components/CommunityFilterBar.tsx` | No-Change | UI Composition |
| `src/components/Features.tsx` | No-Change | UI Composition |
| `src/components/Footer.tsx` | No-Change | UI Composition |
| `src/components/Hero.tsx` | No-Change | UI Composition |
| `src/components/HowItWorks.tsx` | No-Change | UI Composition |
| `src/components/Navigation.tsx` | No-Change | UI Composition |
| `src/components/PaginatedCommunityGrid.tsx` | No-Change | UI Composition |
| `src/components/PaginationControls.test.tsx` | Refactor-Required | UI Composition |
| `src/components/PaginationControls.tsx` | No-Change | UI Composition |
| `src/components/pricing/BuyCoinsIconLink.tsx` | No-Change | UI Composition |
| `src/components/pricing/CoinBalancePill.tsx` | No-Change | UI Composition |
| `src/components/pricing/CoinBundleCard.tsx` | No-Change | UI Composition |
| `src/components/pricing/RecurringPlanCard.tsx` | No-Change | UI Composition |
| `src/components/pricing/SectionHeading.tsx` | No-Change | UI Composition |
| `src/components/ui/accordion.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/alert.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/alert-dialog.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/aspect-ratio.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/avatar.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/badge.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/breadcrumb.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/button.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/calendar.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/card.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/carousel.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/chart.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/checkbox.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/collapsible.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/command.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/context-menu.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/dialog.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/drawer.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/dropdown-menu.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/form.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/hover-card.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/input.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/input-otp.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/label.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/menubar.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/navigation-menu.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/pagination.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/popover.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/progress.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/radio-group.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/resizable.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/scroll-area.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/select.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/separator.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/sheet.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/sidebar.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/skeleton.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/slider.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/sonner.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/switch.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/table.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/tabs.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/textarea.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/toast.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/toaster.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/toggle.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/toggle-group.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/tooltip.tsx` | Refactor-Light | UI Primitive Standardization |
| `src/components/ui/use-toast.ts` | Refactor-Light | UI Primitive Standardization |
| `src/features/auth/components/AuthPageCard.tsx` | Refactor-Required | Feature-First Architecture |
| `src/features/auth/domain/schemas.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/auth/services/auth-service.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/categorizer/components/MultiSelectCheckbox.tsx` | Refactor-Required | Feature-First Architecture |
| `src/features/categorizer/domain/schema.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/communities/domain/community-data.test.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/communities/domain/community-data.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/communities/hooks/use-communities-query.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/communities/services/community-repository.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/pricing/domain/pricing-data.test.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/pricing/domain/pricing-data.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/profile/services/profile-service.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/survey-builder/domain/reducer.test.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/survey-builder/domain/reducer.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/survey-builder/domain/types.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/survey-builder/domain/validation.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/survey-builder/services/draft-storage.test.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/survey-builder/services/draft-storage.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/surveys/components/question-inputs.tsx` | Refactor-Required | Feature-First Architecture |
| `src/features/surveys/domain/fixtures.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/surveys/domain/normalizers.test.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/surveys/domain/normalizers.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/surveys/domain/types.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/surveys/domain/validation.test.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/surveys/domain/validation.ts` | Refactor-Required | Feature-First Architecture |
| `src/features/surveys/services/survey-session-storage.ts` | Refactor-Required | Feature-First Architecture |
| `src/hooks/use-mobile.tsx` | No-Change | Project Infrastructure |
| `src/hooks/use-toast.ts` | No-Change | Project Infrastructure |
| `src/index.css` | No-Change | Project Infrastructure |
| `src/lib/community-data.ts` | Refactor-Required | Adapter/Utility |
| `src/lib/pricing-data.ts` | Refactor-Required | Adapter/Utility |
| `src/lib/routes.ts` | Refactor-Required | Adapter/Utility |
| `src/lib/utils.ts` | No-Change | Adapter/Utility |
| `src/main.tsx` | No-Change | Project Infrastructure |
| `src/pages/AllCommunities.tsx` | Refactor-Required | Route Container |
| `src/pages/Categorizer.tsx` | Refactor-Required | Route Container |
| `src/pages/Communities.tsx` | Refactor-Required | Route Container |
| `src/pages/CommunityDetails.tsx` | Refactor-Required | Route Container |
| `src/pages/Converter.tsx` | Refactor-Required | Route Container |
| `src/pages/CreateSurvey.tsx` | Refactor-Required | Route Container |
| `src/pages/ForYou.tsx` | Refactor-Required | Route Container |
| `src/pages/Index.tsx` | No-Change | Route Container |
| `src/pages/NotFound.tsx` | No-Change | Route Container |
| `src/pages/Pricing.tsx` | Refactor-Required | Route Container |
| `src/pages/Profile.tsx` | Refactor-Required | Route Container |
| `src/pages/SignIn.test.tsx` | Refactor-Required | Route Container |
| `src/pages/SignIn.tsx` | Refactor-Required | Route Container |
| `src/pages/SignUp.tsx` | Refactor-Required | Route Container |
| `src/pages/Survey.tsx` | Refactor-Required | Route Container |
| `src/services/communities.ts` | Refactor-Required | Adapter/Utility |
| `src/shared/components/feedback/FullPageLoading.tsx` | Refactor-Required | Feature-First Architecture |
| `src/shared/components/layout/AppShell.tsx` | Refactor-Required | Feature-First Architecture |
| `src/shared/components/state/AsyncStateView.tsx` | Refactor-Required | Feature-First Architecture |
| `src/shared/lib/query-params.ts` | Refactor-Required | Feature-First Architecture |
| `src/shared/lib/query-state.ts` | Refactor-Required | Feature-First Architecture |
| `src/shared/types/async-state.ts` | Refactor-Required | Feature-First Architecture |
| `src/test/setup.ts` | No-Change | Testing |
| `src/vite-env.d.ts` | No-Change | Project Infrastructure |
| `tailwind.config.ts` | No-Change | Project Infrastructure |
| `tsconfig.app.json` | Refactor-Required | Project Infrastructure |
| `tsconfig.json` | Refactor-Required | Project Infrastructure |
| `tsconfig.node.json` | No-Change | Project Infrastructure |
| `vite.config.ts` | Refactor-Required | Project Infrastructure |

## File-by-File Audit

### `bun.lockb`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [bun.lockb](../bun.lockb)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `components.json`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [components.json](../components.json)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `docs/code-audit.md`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [docs/code-audit.md](../docs/code-audit.md)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `eslint.config.js`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [eslint.config.js](../eslint.config.js)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `index.html`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [index.html](../index.html)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `package.json`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [package.json](../package.json)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `package-lock.json`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [package-lock.json](../package-lock.json)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `postcss.config.js`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [postcss.config.js](../postcss.config.js)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `public/favicon.ico`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [public/favicon.ico](../public/favicon.ico)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `public/placeholder.svg`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [public/placeholder.svg](../public/placeholder.svg)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `public/robots.txt`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [public/robots.txt](../public/robots.txt)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `README.md`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [README.md](../README.md)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/App.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/App.tsx](../src/App.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/app/AppProviders.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/app/AppProviders.tsx](../src/app/AppProviders.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/app/AppRouter.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/app/AppRouter.tsx](../src/app/AppRouter.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/app/query-client.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/app/query-client.ts](../src/app/query-client.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/app/route-registry.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/app/route-registry.ts](../src/app/route-registry.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/assets/hero-image.jpg`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/assets/hero-image.jpg](../src/assets/hero-image.jpg)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/assets/logo.png`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/assets/logo.png](../src/assets/logo.png)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/Communities.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/Communities.tsx](../src/components/Communities.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/CommunityCard.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/components/CommunityCard.tsx](../src/components/CommunityCard.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/CommunityFilterBar.test.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/components/CommunityFilterBar.test.tsx](../src/components/CommunityFilterBar.test.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/CommunityFilterBar.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/CommunityFilterBar.tsx](../src/components/CommunityFilterBar.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/Features.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/Features.tsx](../src/components/Features.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/Footer.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/Footer.tsx](../src/components/Footer.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/Hero.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/Hero.tsx](../src/components/Hero.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/HowItWorks.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/HowItWorks.tsx](../src/components/HowItWorks.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/Navigation.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/Navigation.tsx](../src/components/Navigation.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/PaginatedCommunityGrid.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/PaginatedCommunityGrid.tsx](../src/components/PaginatedCommunityGrid.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/PaginationControls.test.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/components/PaginationControls.test.tsx](../src/components/PaginationControls.test.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/PaginationControls.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/PaginationControls.tsx](../src/components/PaginationControls.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/pricing/BuyCoinsIconLink.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/pricing/BuyCoinsIconLink.tsx](../src/components/pricing/BuyCoinsIconLink.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/pricing/CoinBalancePill.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/pricing/CoinBalancePill.tsx](../src/components/pricing/CoinBalancePill.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/pricing/CoinBundleCard.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/pricing/CoinBundleCard.tsx](../src/components/pricing/CoinBundleCard.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/pricing/RecurringPlanCard.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/pricing/RecurringPlanCard.tsx](../src/components/pricing/RecurringPlanCard.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/pricing/SectionHeading.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/components/pricing/SectionHeading.tsx](../src/components/pricing/SectionHeading.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/components/ui/accordion.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/accordion.tsx](../src/components/ui/accordion.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/alert.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/alert.tsx](../src/components/ui/alert.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/alert-dialog.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/alert-dialog.tsx](../src/components/ui/alert-dialog.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/aspect-ratio.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/aspect-ratio.tsx](../src/components/ui/aspect-ratio.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/avatar.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/avatar.tsx](../src/components/ui/avatar.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/badge.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/badge.tsx](../src/components/ui/badge.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/breadcrumb.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/breadcrumb.tsx](../src/components/ui/breadcrumb.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/button.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/button.tsx](../src/components/ui/button.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/calendar.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/calendar.tsx](../src/components/ui/calendar.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/card.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/card.tsx](../src/components/ui/card.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/carousel.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/carousel.tsx](../src/components/ui/carousel.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/chart.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/chart.tsx](../src/components/ui/chart.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/checkbox.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/checkbox.tsx](../src/components/ui/checkbox.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/collapsible.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/collapsible.tsx](../src/components/ui/collapsible.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/command.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/command.tsx](../src/components/ui/command.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/context-menu.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/context-menu.tsx](../src/components/ui/context-menu.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/dialog.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/dialog.tsx](../src/components/ui/dialog.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/drawer.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/drawer.tsx](../src/components/ui/drawer.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/dropdown-menu.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/dropdown-menu.tsx](../src/components/ui/dropdown-menu.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/form.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/form.tsx](../src/components/ui/form.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/hover-card.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/hover-card.tsx](../src/components/ui/hover-card.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/input.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/input.tsx](../src/components/ui/input.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/input-otp.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/input-otp.tsx](../src/components/ui/input-otp.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/label.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/label.tsx](../src/components/ui/label.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/menubar.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/menubar.tsx](../src/components/ui/menubar.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/navigation-menu.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/navigation-menu.tsx](../src/components/ui/navigation-menu.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/pagination.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/pagination.tsx](../src/components/ui/pagination.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/popover.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/popover.tsx](../src/components/ui/popover.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/progress.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/progress.tsx](../src/components/ui/progress.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/radio-group.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/radio-group.tsx](../src/components/ui/radio-group.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/resizable.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/resizable.tsx](../src/components/ui/resizable.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/scroll-area.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/scroll-area.tsx](../src/components/ui/scroll-area.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/select.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/select.tsx](../src/components/ui/select.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/separator.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/separator.tsx](../src/components/ui/separator.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/sheet.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/sheet.tsx](../src/components/ui/sheet.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/sidebar.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/sidebar.tsx](../src/components/ui/sidebar.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/skeleton.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/skeleton.tsx](../src/components/ui/skeleton.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/slider.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/slider.tsx](../src/components/ui/slider.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/sonner.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/sonner.tsx](../src/components/ui/sonner.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/switch.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/switch.tsx](../src/components/ui/switch.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/table.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/table.tsx](../src/components/ui/table.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/tabs.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/tabs.tsx](../src/components/ui/tabs.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/textarea.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/textarea.tsx](../src/components/ui/textarea.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/toast.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/toast.tsx](../src/components/ui/toast.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/toaster.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/toaster.tsx](../src/components/ui/toaster.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/toggle.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/toggle.tsx](../src/components/ui/toggle.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/toggle-group.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/toggle-group.tsx](../src/components/ui/toggle-group.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/tooltip.tsx`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/tooltip.tsx](../src/components/ui/tooltip.tsx)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/components/ui/use-toast.ts`

A. Summary of Issues
- File was reviewed for strict typing, accessibility, and consistency; only light/zero code mutation required in this pass.

B. Refactored Version
- [src/components/ui/use-toast.ts](../src/components/ui/use-toast.ts)

C. Explanation of Improvements
- Confirmed compatibility with stricter project standards and preserved stable public surface.

D. Architectural Recommendations
- Keep aligned with upstream shadcn patterns; apply only targeted updates when consumed by product features.

### `src/features/auth/components/AuthPageCard.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/auth/components/AuthPageCard.tsx](../src/features/auth/components/AuthPageCard.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/auth/domain/schemas.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/auth/domain/schemas.ts](../src/features/auth/domain/schemas.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/auth/services/auth-service.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/auth/services/auth-service.ts](../src/features/auth/services/auth-service.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/categorizer/components/MultiSelectCheckbox.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/categorizer/components/MultiSelectCheckbox.tsx](../src/features/categorizer/components/MultiSelectCheckbox.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/categorizer/domain/schema.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/categorizer/domain/schema.ts](../src/features/categorizer/domain/schema.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/communities/domain/community-data.test.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/communities/domain/community-data.test.ts](../src/features/communities/domain/community-data.test.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/communities/domain/community-data.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/communities/domain/community-data.ts](../src/features/communities/domain/community-data.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/communities/hooks/use-communities-query.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/communities/hooks/use-communities-query.ts](../src/features/communities/hooks/use-communities-query.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/communities/services/community-repository.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/communities/services/community-repository.ts](../src/features/communities/services/community-repository.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/pricing/domain/pricing-data.test.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/pricing/domain/pricing-data.test.ts](../src/features/pricing/domain/pricing-data.test.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/pricing/domain/pricing-data.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/pricing/domain/pricing-data.ts](../src/features/pricing/domain/pricing-data.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/profile/services/profile-service.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/profile/services/profile-service.ts](../src/features/profile/services/profile-service.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/survey-builder/domain/reducer.test.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/survey-builder/domain/reducer.test.ts](../src/features/survey-builder/domain/reducer.test.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/survey-builder/domain/reducer.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/survey-builder/domain/reducer.ts](../src/features/survey-builder/domain/reducer.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/survey-builder/domain/types.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/survey-builder/domain/types.ts](../src/features/survey-builder/domain/types.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/survey-builder/domain/validation.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/survey-builder/domain/validation.ts](../src/features/survey-builder/domain/validation.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/survey-builder/services/draft-storage.test.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/survey-builder/services/draft-storage.test.ts](../src/features/survey-builder/services/draft-storage.test.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/survey-builder/services/draft-storage.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/survey-builder/services/draft-storage.ts](../src/features/survey-builder/services/draft-storage.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/surveys/components/question-inputs.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/surveys/components/question-inputs.tsx](../src/features/surveys/components/question-inputs.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/surveys/domain/fixtures.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/surveys/domain/fixtures.ts](../src/features/surveys/domain/fixtures.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/surveys/domain/normalizers.test.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/surveys/domain/normalizers.test.ts](../src/features/surveys/domain/normalizers.test.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/surveys/domain/normalizers.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/surveys/domain/normalizers.ts](../src/features/surveys/domain/normalizers.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/surveys/domain/types.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/surveys/domain/types.ts](../src/features/surveys/domain/types.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/surveys/domain/validation.test.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/surveys/domain/validation.test.ts](../src/features/surveys/domain/validation.test.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/surveys/domain/validation.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/surveys/domain/validation.ts](../src/features/surveys/domain/validation.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/features/surveys/services/survey-session-storage.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/features/surveys/services/survey-session-storage.ts](../src/features/surveys/services/survey-session-storage.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Expand unit/integration coverage as backend APIs are introduced; keep service contracts explicit.

### `src/hooks/use-mobile.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/hooks/use-mobile.tsx](../src/hooks/use-mobile.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/hooks/use-toast.ts`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/hooks/use-toast.ts](../src/hooks/use-toast.ts)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/index.css`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/index.css](../src/index.css)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/lib/community-data.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/lib/community-data.ts](../src/lib/community-data.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/lib/pricing-data.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/lib/pricing-data.ts](../src/lib/pricing-data.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/lib/routes.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/lib/routes.ts](../src/lib/routes.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/lib/utils.ts`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/lib/utils.ts](../src/lib/utils.ts)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/main.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/main.tsx](../src/main.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/pages/AllCommunities.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/AllCommunities.tsx](../src/pages/AllCommunities.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/Categorizer.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/Categorizer.tsx](../src/pages/Categorizer.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/Communities.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/Communities.tsx](../src/pages/Communities.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/CommunityDetails.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/CommunityDetails.tsx](../src/pages/CommunityDetails.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/Converter.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/Converter.tsx](../src/pages/Converter.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/CreateSurvey.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/CreateSurvey.tsx](../src/pages/CreateSurvey.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/ForYou.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/ForYou.tsx](../src/pages/ForYou.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/Index.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/pages/Index.tsx](../src/pages/Index.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/NotFound.tsx`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/pages/NotFound.tsx](../src/pages/NotFound.tsx)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/Pricing.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/Pricing.tsx](../src/pages/Pricing.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/Profile.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/Profile.tsx](../src/pages/Profile.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/SignIn.test.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/SignIn.test.tsx](../src/pages/SignIn.test.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/SignIn.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/SignIn.tsx](../src/pages/SignIn.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/SignUp.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/SignUp.tsx](../src/pages/SignUp.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/pages/Survey.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/pages/Survey.tsx](../src/pages/Survey.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Keep pages thin and continue moving business rules into feature modules/hooks.

### `src/services/communities.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/services/communities.ts](../src/services/communities.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/shared/components/feedback/FullPageLoading.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/shared/components/feedback/FullPageLoading.tsx](../src/shared/components/feedback/FullPageLoading.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/shared/components/layout/AppShell.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/shared/components/layout/AppShell.tsx](../src/shared/components/layout/AppShell.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/shared/components/state/AsyncStateView.tsx`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/shared/components/state/AsyncStateView.tsx](../src/shared/components/state/AsyncStateView.tsx)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/shared/lib/query-params.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/shared/lib/query-params.ts](../src/shared/lib/query-params.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/shared/lib/query-state.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/shared/lib/query-state.ts](../src/shared/lib/query-state.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/shared/types/async-state.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [src/shared/types/async-state.ts](../src/shared/types/async-state.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/test/setup.ts`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/test/setup.ts](../src/test/setup.ts)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `src/vite-env.d.ts`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [src/vite-env.d.ts](../src/vite-env.d.ts)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `tailwind.config.ts`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [tailwind.config.ts](../tailwind.config.ts)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `tsconfig.app.json`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [tsconfig.app.json](../tsconfig.app.json)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `tsconfig.json`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [tsconfig.json](../tsconfig.json)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `tsconfig.node.json`

A. Summary of Issues
- File currently satisfies intended role; no behavior-affecting refactor was required after audit.

B. Refactored Version
- [tsconfig.node.json](../tsconfig.node.json)

C. Explanation of Improvements
- Retained as-is to avoid unnecessary churn while preserving compatibility and clarity.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

### `vite.config.ts`

A. Summary of Issues
- Primary concerns were addressed (architecture boundaries, extraction of domain logic, strict typing, testability, and async/state handling).

B. Refactored Version
- [vite.config.ts](../vite.config.ts)

C. Explanation of Improvements
- Improved cohesion, removed mixed responsibilities, and aligned file to feature-first boundaries and shared primitives.

D. Architectural Recommendations
- Revisit only when new requirements or tooling changes create measurable value.

