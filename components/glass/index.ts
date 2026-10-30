/**
 * Liquid Glass — the registry.
 *
 * Every export is a shadcn/ui component re-poured in liquid glass.
 * Materials resolve per component family (see lib/glass-theme.ts),
 * adapt to light/dark automatically, and can be overridden per use:
 *
 *   <GlassCard surface="transparent">…</GlassCard>
 */
export {
  GlassThemeProvider,
  useGlassTheme,
  type GlassModeSetting,
} from "@/components/glass/glass-theme-provider";
export {
  GlassSurface,
  GlassContent,
  type GlassSurfaceProps,
} from "@/components/glass/glass-surface";
export {
  GlassModeToggle,
  SurfacePicker,
  GlobalSurfacePicker,
} from "@/components/glass/glass-controls";

export {
  GlassButton,
  type GlassButtonProps,
} from "@/components/glass/glass-button";
export { GlassBadge } from "@/components/glass/glass-badge";
export {
  GlassCard,
  CardHeader as GlassCardHeader,
  CardTitle as GlassCardTitle,
  CardDescription as GlassCardDescription,
  CardAction as GlassCardAction,
  CardContent as GlassCardContent,
  CardFooter as GlassCardFooter,
} from "@/components/glass/glass-card";
export {
  GlassInput,
  GlassTextarea,
  Label as GlassLabel,
} from "@/components/glass/glass-input";
export { GlassSwitch } from "@/components/glass/glass-switch";
export { GlassProgress } from "@/components/glass/glass-progress";
export { GlassSlider, GlassSliderSource } from "@/components/glass/glass-slider";
export {
  GlassLens,
  type GlassLensProps,
} from "@/components/glass/glass-target-lens";
export {
  GlassCheckbox,
  GlassRadioGroup,
  GlassRadioGroupItem,
} from "@/components/glass/glass-checkbox";
export {
  GlassToggle,
  GlassToggleGroup,
  GlassToggleGroupItem,
  type GlassToggleOption,
} from "@/components/glass/glass-toggle";
export {
  GlassTabs,
  GlassTabsList,
  TabsTrigger as GlassTabsTrigger,
  TabsContent as GlassTabsContent,
} from "@/components/glass/glass-tabs";
export {
  GlassAlert,
  AlertTitle as GlassAlertTitle,
  AlertDescription as GlassAlertDescription,
} from "@/components/glass/glass-alert";
export {
  GlassAvatar,
  GlassAvatarImage,
  GlassAvatarFallback,
  GlassSeparator,
} from "@/components/glass/glass-avatar";

export {
  GlassDropdownMenuContent,
  GlassDropdownMenuSubContent,
  DropdownMenu as GlassDropdownMenu,
  DropdownMenuTrigger as GlassDropdownMenuTrigger,
  DropdownMenuGroup as GlassDropdownMenuGroup,
  DropdownMenuItem as GlassDropdownMenuItem,
  DropdownMenuCheckboxItem as GlassDropdownMenuCheckboxItem,
  DropdownMenuRadioGroup as GlassDropdownMenuRadioGroup,
  DropdownMenuRadioItem as GlassDropdownMenuRadioItem,
  DropdownMenuLabel as GlassDropdownMenuLabel,
  DropdownMenuSeparator as GlassDropdownMenuSeparator,
  DropdownMenuShortcut as GlassDropdownMenuShortcut,
  DropdownMenuSub as GlassDropdownMenuSub,
  DropdownMenuSubTrigger as GlassDropdownMenuSubTrigger,
} from "@/components/glass/glass-dropdown";

export {
  GlassContextMenuContent,
  GlassContextMenuSubContent,
  ContextMenu as GlassContextMenu,
  ContextMenuTrigger as GlassContextMenuTrigger,
  ContextMenuGroup as GlassContextMenuGroup,
  ContextMenuItem as GlassContextMenuItem,
  ContextMenuCheckboxItem as GlassContextMenuCheckboxItem,
  ContextMenuRadioGroup as GlassContextMenuRadioGroup,
  ContextMenuRadioItem as GlassContextMenuRadioItem,
  ContextMenuLabel as GlassContextMenuLabel,
  ContextMenuSeparator as GlassContextMenuSeparator,
  ContextMenuShortcut as GlassContextMenuShortcut,
  ContextMenuSub as GlassContextMenuSub,
  ContextMenuSubTrigger as GlassContextMenuSubTrigger,
} from "@/components/glass/glass-context-menu";

export {
  GlassMenubar,
  GlassMenubarContent,
  GlassMenubarSubContent,
  MenubarMenu as GlassMenubarMenu,
  MenubarTrigger as GlassMenubarTrigger,
  MenubarItem as GlassMenubarItem,
  MenubarCheckboxItem as GlassMenubarCheckboxItem,
  MenubarRadioGroup as GlassMenubarRadioGroup,
  MenubarRadioItem as GlassMenubarRadioItem,
  MenubarLabel as GlassMenubarLabel,
  MenubarSeparator as GlassMenubarSeparator,
  MenubarShortcut as GlassMenubarShortcut,
  MenubarSub as GlassMenubarSub,
  MenubarSubTrigger as GlassMenubarSubTrigger,
} from "@/components/glass/glass-menubar";

export {
  GlassSelectTrigger,
  GlassSelectContent,
  Select as GlassSelect,
  SelectGroup as GlassSelectGroup,
  SelectValue as GlassSelectValue,
  SelectItem as GlassSelectItem,
  SelectLabel as GlassSelectLabel,
  SelectSeparator as GlassSelectSeparator,
} from "@/components/glass/glass-select";

export {
  GlassPopoverContent,
  Popover as GlassPopover,
  PopoverTrigger as GlassPopoverTrigger,
  PopoverHeader as GlassPopoverHeader,
  PopoverTitle as GlassPopoverTitle,
  PopoverDescription as GlassPopoverDescription,
} from "@/components/glass/glass-popover";

export {
  GlassTooltipContent,
  Tooltip as GlassTooltip,
  TooltipTrigger as GlassTooltipTrigger,
  TooltipProvider as GlassTooltipProvider,
} from "@/components/glass/glass-tooltip";

export {
  GlassHoverCardContent,
  HoverCard as GlassHoverCard,
  HoverCardTrigger as GlassHoverCardTrigger,
} from "@/components/glass/glass-hover-card";

export {
  GlassDialogOverlay,
  GlassDialogContent,
  Dialog as GlassDialog,
  DialogTrigger as GlassDialogTrigger,
  DialogClose as GlassDialogClose,
  DialogHeader as GlassDialogHeader,
  DialogFooter as GlassDialogFooter,
  DialogTitle as GlassDialogTitle,
  DialogDescription as GlassDialogDescription,
} from "@/components/glass/glass-dialog";

export {
  GlassAlertDialogContent,
  AlertDialog as GlassAlertDialog,
  AlertDialogTrigger as GlassAlertDialogTrigger,
  AlertDialogHeader as GlassAlertDialogHeader,
  AlertDialogFooter as GlassAlertDialogFooter,
  AlertDialogTitle as GlassAlertDialogTitle,
  AlertDialogDescription as GlassAlertDialogDescription,
  AlertDialogAction as GlassAlertDialogAction,
  AlertDialogCancel as GlassAlertDialogCancel,
} from "@/components/glass/glass-alert-dialog";

export {
  GlassSheetContent,
  Sheet as GlassSheet,
  SheetTrigger as GlassSheetTrigger,
  SheetClose as GlassSheetClose,
  SheetHeader as GlassSheetHeader,
  SheetTitle as GlassSheetTitle,
  SheetDescription as GlassSheetDescription,
} from "@/components/glass/glass-sheet";

export {
  GlassDrawerContent,
  Drawer as GlassDrawer,
  DrawerTrigger as GlassDrawerTrigger,
  DrawerClose as GlassDrawerClose,
  DrawerHeader as GlassDrawerHeader,
  DrawerFooter as GlassDrawerFooter,
  DrawerTitle as GlassDrawerTitle,
  DrawerDescription as GlassDrawerDescription,
} from "@/components/glass/glass-drawer";

export {
  GlassCommand,
  GlassCommandInput,
  GlassCommandDialog,
  GlassCommandFooter,
  GlassCommandList,
  GlassCommandEmpty,
  GlassCommandGroup,
  GlassCommandSeparator,
  GlassCommandItem,
  GlassCommandShortcut,
} from "@/components/glass/glass-command";

export {
  GlassNavigationMenu,
  GlassNavigationMenuList,
  GlassNavigationMenuTrigger,
  GlassNavigationMenuContent,
  GlassNavigationMenuLink,
  NavigationMenuItem as GlassNavigationMenuItem,
} from "@/components/glass/glass-navigation-menu";

export {
  GlassToaster,
  GlassToast,
  glassToast,
  type GlassToastOptions,
} from "@/components/glass/glass-toaster";

export {
  GlassButtonGroup,
  GlassButtonGroupSeparator,
  GlassButtonGroupText,
} from "@/components/glass/glass-button-group";
export {
  GlassCombobox,
  type GlassComboboxProps,
  type GlassComboboxOption,
} from "@/components/glass/glass-combobox";
export {
  GlassForm,
  GlassFormField,
  useGlassFormField,
} from "@/components/glass/glass-form";
export { GlassNavbar } from "@/components/glass/glass-navbar";
export {
  GlassSidebar,
  GlassSidebarItem,
} from "@/components/glass/glass-sidebar";
export {
  GlassScene,
  GlassSettingsProvider,
  useGlassSettings,
  type GlassSettings,
  type GlassThemeBehavior,
} from "@/components/glass-scene";
export {
  GlassAccordion,
  GlassAccordionItem,
  GlassAccordionTrigger,
  GlassAccordionContent,
} from "@/components/glass/glass-accordion";

export {
  GlassMusicPlayer,
  type GlassMusicPlayerProps,
  type GlassTrack,
} from "@/components/glass/glass-music-player";
export {
  GlassControlCenter,
  type GlassControlCenterProps,
  type GlassControlCenterState,
} from "@/components/glass/glass-control-center";
export {
  GlassSpotlight,
  GlassSpotlightPanel,
  type GlassSpotlightProps,
  type GlassSpotlightCommand,
} from "@/components/glass/glass-spotlight";
export {
  GlassPowerMenu,
  GlassPowerDialog,
  GlassPowerPanel,
  type GlassPowerPanelProps,
  type GlassPowerMenuProps,
  type GlassPowerDialogProps,
  type GlassPowerAction,
} from "@/components/glass/glass-power";

export {
  GlassPreferences,
  type GlassPreferencesValue,
} from "@/components/glass/glass-preferences";

export {
  GlassSound,
  type GlassSoundProps,
} from "@/components/glass/glass-sound";
export {
  GlassConnectivity,
  type GlassConnectivityProps,
} from "@/components/glass/glass-connectivity";
export {
  GlassRangeControl,
  type GlassRangeControlProps,
} from "@/components/glass/glass-range-control";

export { GlassStateSwap } from "@/components/glass/glass-state-swap";
export {
  GlassSaveButton,
  GlassLikeButton,
  GlassAddButton,
} from "@/components/glass/glass-state-button";

export { GlassIcon, type GlassIconName } from "@/components/glass/glass-icons";

export { GlassDock, GlassDockItem } from "@/components/glass/glass-dock";
export type { GlassDockProps } from "@/components/glass/glass-dock";

export { GlassAtlas } from "@/components/glass-atlas";
export { GlassElasticButton } from "@/components/glass/glass-elastic-button";
export {
  GlassVideoPlayer,
  type GlassVideoPlayerProps,
} from "@/components/glass/glass-video-player";
export type { GlassShape } from "@/lib/glass";

export { GlassLensButton, type GlassLensButtonProps } from "@/components/glass/glass-lens-button";
export { GlassImageLens, type GlassImageLensProps } from "@/components/glass/glass-image-lens";
