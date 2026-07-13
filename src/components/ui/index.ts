/**
 * ReFrame Design System — central component registry.
 *
 * One import surface for the whole app: `import { Button, Dialog, Tabs } from
 * "@/components/ui"`. This is the FOUNDATION layer (shadcn/Radix-based: tokened,
 * dark-mode native, accessible, keyboard-navigable). The two premium layers
 * compose on top of it:
 *   - Effects:  "@/components/blocks/fx"      (Spotlight, Aurora, Meteors, ...)
 *   - Heroes/sections: "@/components/blocks"  (premium generated-site blocks)
 *
 * See DESIGN_SYSTEM.md for the architecture and tokens.
 */

// Primitives (shadcn/Radix foundation)
export { Button, buttonVariants, type ButtonProps } from "./button";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";
export { Input } from "./input";
export { Label } from "./label";
export { Badge, badgeVariants } from "./badge";
export { Accordion } from "./accordion";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./sheet";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

// Premium in-app primitives (ReFrame originals on the same tokens)
export { Bezel } from "./bezel";
export { BlurReveal } from "./blur-reveal";
export { BrowserFrame } from "./browser-frame";
export { IslandButton } from "./island-button";
export { Reveal } from "./reveal";
export { GlassPillNav, type GlassPillNavItem, type GlassPillNavProps } from "./glass-pill-nav";
export { StatGroup, type Stat, type StatGroupProps } from "./stat-group";
