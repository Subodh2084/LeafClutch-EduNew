"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

import { CategoryIcon } from "@/components/courses/CategoryIcon";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { siteConfig } from "@/config/site";
import { courseHref, coursesHref } from "@/lib/course-display";
import { cn } from "@/lib/utils";
import type { CourseNavGroup } from "@/types/course";

const PANEL_ID = "nav-category-courses";

export function DesktopNav({ groups }: { groups: CourseNavGroup[] }) {
  const [activeSlug, setActiveSlug] = useState(groups[0]?.category.slug);
  const active = groups.find((group) => group.category.slug === activeSlug) ?? groups[0];

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <NavigationMenuTrigger>Courses</NavigationMenuTrigger>
          <NavigationMenuContent className="w-[680px] p-0">
            <div className="grid grid-cols-[250px_1fr]">
              <ul className="space-y-0.5 border-r bg-surface-blue/50 p-2">
                {groups.map(({ category }) => {
                  const isActive = category.slug === active?.category.slug;
                  return (
                    <li key={category.id}>
                      {/* Hover, focus or click reveals the category's courses. */}
                      <button
                        type="button"
                        aria-expanded={isActive}
                        aria-controls={PANEL_ID}
                        onMouseEnter={() => setActiveSlug(category.slug)}
                        onFocus={() => setActiveSlug(category.slug)}
                        onClick={() => setActiveSlug(category.slug)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          isActive
                            ? "bg-white font-medium text-navy shadow-card"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <CategoryIcon slug={category.slug} className="size-4 shrink-0" />
                        {category.name}
                        <ChevronRight aria-hidden className="ml-auto size-3.5 opacity-60" />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {active && (
                <div id={PANEL_ID} className="flex flex-col p-4">
                  <p className="px-2 text-xs font-medium text-muted-foreground">
                    {active.category.name}
                  </p>
                  <ul className="mt-2 space-y-0.5">
                    {active.courses.map((course) => (
                      <li key={course.id}>
                        <NavigationMenuLink
                          render={<Link href={courseHref(course.slug)} />}
                          className="px-2 py-2 font-medium text-foreground hover:text-navy"
                        >
                          {course.name}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between gap-4 border-t pt-3">
                    <NavigationMenuLink
                      render={<Link href={coursesHref({ category: active.category.slug })} />}
                      className="px-2 font-medium text-navy"
                    >
                      All {active.category.short_name} courses
                      <ArrowRight aria-hidden />
                    </NavigationMenuLink>
                    <NavigationMenuLink
                      render={<Link href="/courses" />}
                      className="px-2 text-muted-foreground hover:text-navy"
                    >
                      Browse all courses
                    </NavigationMenuLink>
                  </div>
                </div>
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>We Provide Solutions To</NavigationMenuTrigger>
          <NavigationMenuContent className="w-[360px] p-2">
            <ul className="space-y-0.5">
              {siteConfig.nav.solutions.map((solution) => (
                <li key={solution.href}>
                  <NavigationMenuLink
                    render={<Link href={solution.href} />}
                    className="flex-col items-start gap-0.5 px-3 py-2.5"
                  >
                    <span className="font-medium text-foreground">{solution.title}</span>
                    <span className="text-muted-foreground">{solution.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
