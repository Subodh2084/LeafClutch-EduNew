"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu } from "lucide-react";

import { CategoryIcon } from "@/components/courses/CategoryIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { courseHref, coursesHref } from "@/lib/course-display";
import { cn } from "@/lib/utils";
import type { CourseNavGroup } from "@/types/course";

const sectionTrigger = "py-4 text-base hover:no-underline";
const groupTrigger = "py-2.5 text-sm font-medium text-foreground hover:no-underline";
const linkClass =
  "block rounded-md px-3 py-2.5 text-sm text-muted-foreground no-underline outline-none hover:bg-surface-blue hover:text-navy focus-visible:ring-3 focus-visible:ring-ring/50";

export function MobileNav({ groups }: { groups: CourseNavGroup[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-lg" className="lg:hidden" />}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-5 py-2">
          <Accordion>
            <AccordionItem value="courses">
              <AccordionTrigger className={sectionTrigger}>Courses</AccordionTrigger>
              <AccordionContent className="[&_a]:no-underline">
                <Link href="/courses" onClick={close} className={cn(linkClass, "font-medium text-navy")}>
                  Browse all courses
                </Link>
                <Accordion className="mt-1">
                  {groups.map(({ category, courses }) => (
                    <AccordionItem key={category.id} value={category.slug} className="border-none">
                      <AccordionTrigger className={groupTrigger}>
                        <span className="flex items-center gap-2.5 px-3">
                          <CategoryIcon slug={category.slug} className="size-4 text-navy" />
                          {category.name}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pl-6 [&_a]:no-underline">
                        <ul>
                          {courses.map((course) => (
                            <li key={course.id}>
                              <Link href={courseHref(course.slug)} onClick={close} className={linkClass}>
                                {course.name}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              href={coursesHref({ category: category.slug })}
                              onClick={close}
                              className={cn(linkClass, "inline-flex items-center gap-1.5 font-medium text-navy")}
                            >
                              All {category.short_name} courses
                              <ArrowRight aria-hidden className="size-3.5" />
                            </Link>
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="solutions">
              <AccordionTrigger className={sectionTrigger}>We Provide Solutions To</AccordionTrigger>
              <AccordionContent className="[&_a]:no-underline">
                <ul>
                  {siteConfig.nav.solutions.map((solution) => (
                    <li key={solution.href}>
                      <Link href={solution.href} onClick={close} className={linkClass}>
                        {solution.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </nav>

        <div className="border-t p-5">
          <Link
            href={siteConfig.nav.login}
            onClick={close}
            className={cn(buttonVariants({ size: "xl" }), "w-full")}
          >
            Login
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
