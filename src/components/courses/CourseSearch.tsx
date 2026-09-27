"use client";

import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { ArrowRight, LoaderCircle, Search } from "lucide-react";

import { CourseSearchResult } from "@/components/courses/CourseSearchResult";
import { Button } from "@/components/ui/button";
import { coursesHref } from "@/lib/course-display";
import { filterCourses } from "@/lib/course-search";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

type CourseSearchProps =
  | {
      /** Homepage: instant dropdown of matches; Enter opens /courses?search=… */
      mode?: "suggest";
      courses: Course[];
      limit?: number;
      className?: string;
    }
  | {
      /** Courses page: typing updates the URL, which filters the server-rendered grid. */
      mode: "filter";
      /** Current `search` param. */
      value: string;
      /** Current `category` param, preserved while searching. */
      category: string;
      className?: string;
    };

export function CourseSearch(props: CourseSearchProps) {
  return props.mode === "filter" ? <FilterSearch {...props} /> : <SuggestSearch {...props} />;
}

const inputClass =
  "h-14 w-full rounded-xl border border-input bg-white pr-28 pl-12 text-base text-foreground shadow-card transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden";

/** Shared field: a real GET form, so search works before JavaScript loads. */
function SearchForm({
  inputProps,
  hiddenCategory,
  pending,
}: {
  inputProps: React.ComponentProps<"input">;
  hiddenCategory?: string;
  pending?: boolean;
}) {
  const inputId = useId();
  const Icon = pending ? LoaderCircle : Search;

  return (
    <Form action="/courses" role="search" className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search courses
      </label>
      <Icon
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground",
          pending && "animate-spin",
        )}
      />
      <input
        id={inputId}
        name="search"
        type="search"
        autoComplete="off"
        placeholder="Search courses"
        className={inputClass}
        {...inputProps}
      />
      {hiddenCategory && <input type="hidden" name="category" value={hiddenCategory} />}
      <Button type="submit" size="lg" className="absolute top-1/2 right-2 h-10 -translate-y-1/2 px-4">
        Search
      </Button>
    </Form>
  );
}

function SuggestSearch({
  courses,
  limit = 5,
  className,
}: Extract<CourseSearchProps, { courses: Course[] }>) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const statusId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const results = trimmed ? filterCourses(courses, { search: trimmed }) : [];
  const showResults = open && trimmed.length > 0;

  function moveFocus(event: React.KeyboardEvent, direction: 1 | -1) {
    const items = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>("[data-search-result]") ?? [],
    );
    if (items.length === 0) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next = current + direction;
    if (next < 0) inputRef.current?.focus();
    else items[Math.min(next, items.length - 1)].focus();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") moveFocus(event, 1);
    else if (event.key === "ArrowUp") moveFocus(event, -1);
    else if (event.key === "Escape" && showResults) {
      // Focus first: the input's onFocus reopens the panel, so close after it.
      inputRef.current?.focus();
      setOpen(false);
    }
  }

  function handleBlur(event: React.FocusEvent) {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <SearchForm
        inputProps={{
          ref: inputRef,
          value: query,
          onChange: (event) => {
            setQuery(event.target.value);
            setOpen(true);
          },
          onFocus: () => setOpen(true),
          "aria-describedby": statusId,
        }}
      />

      <p id={statusId} aria-live="polite" className="sr-only">
        {trimmed
          ? `${results.length} ${results.length === 1 ? "course" : "courses"} found. Use the down arrow to browse.`
          : ""}
      </p>

      {showResults && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border bg-popover shadow-card-hover">
          {results.length > 0 ? (
            <>
              <ul className="max-h-80 overflow-y-auto p-2">
                {results.slice(0, limit).map((course) => (
                  <li key={course.id}>
                    <CourseSearchResult course={course} />
                  </li>
                ))}
              </ul>
              <div className="border-t p-2">
                <Link
                  href={coursesHref({ search: trimmed })}
                  data-search-result
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-navy outline-none hover:bg-surface-blue focus-visible:bg-surface-blue focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  See all {results.length} {results.length === 1 ? "result" : "results"}
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </>
          ) : (
            <p className="px-4 py-5 text-sm text-muted-foreground">
              No courses match “{trimmed}”.{" "}
              <Link
                href="/courses"
                data-search-result
                className="font-medium text-navy underline-offset-4 hover:underline"
              >
                Browse all courses
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const FILTER_DEBOUNCE_MS = 300;

function FilterSearch({
  value,
  category,
  className,
}: Extract<CourseSearchProps, { mode: "filter" }>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(value);
  const timer = useRef<number | undefined>(undefined);

  // The URL is the source of truth. When `value` changes because of something
  // other than our own typing (Clear filters, back/forward), mirror it.
  const [lastValue, setLastValue] = useState(value);
  const [pushed, setPushed] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== pushed) {
      setPushed(value);
      setQuery(value);
    }
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function update(next: string) {
    setQuery(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const search = next.trim();
      setPushed(search);
      // Replace (not push) so each keystroke doesn't become a history entry.
      startTransition(() => router.replace(coursesHref({ category, search }), { scroll: false }));
    }, FILTER_DEBOUNCE_MS);
  }

  return (
    <div className={className}>
      <SearchForm
        pending={isPending}
        hiddenCategory={category}
        inputProps={{
          value: query,
          onChange: (event) => update(event.target.value),
          onKeyDown: (event) => {
            if (event.key === "Escape" && query) {
              event.preventDefault();
              update("");
            }
          },
        }}
      />
    </div>
  );
}
