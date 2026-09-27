"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  CourseCategoryList,
  type CategoryOption,
} from "@/components/courses/CourseCategoryList";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileCourseFiltersProps {
  options: CategoryOption[];
  totalCount: number;
  activeCategory: string;
  search: string;
}

export function MobileCourseFilters(props: MobileCourseFiltersProps) {
  const [open, setOpen] = useState(false);
  const activeName = props.options.find((o) => o.category.slug === props.activeCategory)?.category
    .short_name;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="lg" className="px-3.5 lg:hidden" />}>
        <SlidersHorizontal aria-hidden />
        Filters
        {activeName && (
          <span className="rounded-full bg-navy px-2 py-0.5 text-xs text-primary-foreground">
            {activeName}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-full gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>Filter courses</SheetTitle>
          <SheetDescription>Choose a category.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Course categories" className="flex-1 overflow-y-auto p-3">
          <CourseCategoryList {...props} onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
