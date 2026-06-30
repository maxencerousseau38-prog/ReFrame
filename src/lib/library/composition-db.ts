/**
 * Composition DB — imports all category data files, triggering registration
 * in the registry at module load time.
 *
 * Import this file once at the application entry point (or in the selector)
 * to ensure the registry is populated before any selectComposition() call.
 *
 * Individual category files may be imported directly if only a subset of
 * categories is needed.
 */

// Hero
export * from "./heroes/index";

// Features
export * from "./features/index";

// About
export * from "./about/index";

// Portfolio
export * from "./portfolio/index";

// Gallery
export * from "./gallery/index";

// Services
export * from "./services/index";

// Pricing
export * from "./pricing/index";

// Stats
export * from "./stats/index";

// Timeline
export * from "./timeline/index";

// Process
export * from "./process/index";

// Team
export * from "./team/index";

// Testimonials
export * from "./testimonials/index";

// FAQ
export * from "./faq/index";

// Contact
export * from "./contact/index";

// Booking
export * from "./booking/index";

// Newsletter
export * from "./newsletter/index";

// CTA
export * from "./cta/index";

// Footer
export * from "./footer/index";
