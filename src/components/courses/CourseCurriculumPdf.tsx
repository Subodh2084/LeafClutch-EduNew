import "server-only";

import { Fragment } from "react";
import { Document, Image, Page, Path, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

import { hasUdemyBonus, learningModeLabels } from "@/lib/course-display";
import { formatPrice, getCoursePricing } from "@/lib/pricing";
import type { CourseDetail, CourseLesson, UdemyBonusCourse } from "@/types/course";

// The downloadable curriculum. It renders the same CourseDetail (modules and
// lessons in display order) that the course page shows, so the two can't drift.
// Built-in Helvetica keeps the file small and needs no font files.

const colors = {
  navy: "#062165",
  text: "#0f1729",
  muted: "#4b5670",
  blue: "#1f5bd8",
  rule: "#d9e0ea",
  surface: "#eef4ff",
  moduleRule: "#d9e8f5",
  // The site's Udemy bonus accent: brand green, and its darker text step.
  green: "#28c840",
  greenText: "#15803d",
  greenSurface: "#effbf1",
};

const A4_HEIGHT = 841.89;
const LOGO_HEIGHT = 30;
const LOGO_ASPECT = 662 / 208; // public/companyLogo/leafclutch-logo.png

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 72,
    paddingHorizontal: 50,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.45,
    color: colors.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.navy,
  },
  logo: { height: LOGO_HEIGHT, width: LOGO_HEIGHT * LOGO_ASPECT },
  headerMeta: { alignItems: "flex-end" },
  headerLabel: { fontFamily: "Helvetica-Bold", fontSize: 10, color: colors.navy },
  headerDate: { fontSize: 8.5, color: colors.muted, marginTop: 2 },

  category: { marginTop: 26, fontSize: 10, color: colors.blue },
  title: { marginTop: 4, fontFamily: "Helvetica-Bold", fontSize: 24, lineHeight: 1.2, color: colors.navy },
  summary: { marginTop: 8, fontSize: 11.5, color: colors.muted },

  bonus: {
    marginTop: 16,
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.greenSurface,
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
    borderRadius: 6,
  },
  bonusIcon: { width: 16, height: 16, marginRight: 10, marginTop: 1 },
  bonusBody: { flex: 1 },
  bonusTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: colors.greenText },
  bonusText: { marginTop: 2, fontSize: 9.5, color: colors.muted },
  bonusLabel: { marginTop: 6, fontSize: 8.5, color: colors.muted },
  bonusCourse: { marginTop: 2, fontSize: 9.5, color: colors.text },
  bonusCourseTitle: { fontFamily: "Helvetica-Bold", color: colors.text, textDecoration: "none" },

  facts: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 6,
  },
  fact: { width: "33.33%", paddingRight: 10, marginBottom: 12 },
  factLabel: { fontSize: 8.5, color: colors.muted },
  factValue: { marginTop: 1, fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  factNote: { fontSize: 8.5, color: colors.muted },

  sectionTitle: { marginTop: 26, fontFamily: "Helvetica-Bold", fontSize: 14, color: colors.navy },
  sectionMeta: { marginTop: 2, fontSize: 9.5, color: colors.muted },
  paragraph: { marginTop: 8, color: colors.text },

  // Module headers and lessons are page-level siblings (see below). Each
  // carries the left rule, and padding (not margin) keeps the rule unbroken.
  moduleHeader: {
    marginTop: 18,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.moduleRule,
  },
  moduleDescriptionRow: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.moduleRule,
  },
  moduleLabel: { fontSize: 8.5, color: colors.blue },
  moduleTitle: { marginTop: 1, fontFamily: "Helvetica-Bold", fontSize: 12.5, lineHeight: 1.3, color: colors.navy },
  moduleDescription: { marginTop: 3, color: colors.muted },
  lesson: {
    flexDirection: "row",
    paddingTop: 6,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.moduleRule,
  },
  firstLesson: { paddingTop: 10 },
  lessonNumber: { width: 20, color: colors.muted },
  lessonBody: { flex: 1 },
  lessonTitle: { fontSize: 10.5 },
  lessonDescription: { marginTop: 1, fontSize: 9.5, color: colors.muted },

  // Positioned from the top: react-pdf resolves bottom against the whole
  // flow rather than each page, which misplaces fixed footers.
  footer: {
    position: "absolute",
    top: A4_HEIGHT - 52,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: colors.rule,
    fontSize: 8.5,
    color: colors.muted,
  },
});

/** Lucide's "gift" (the icon the website uses), drawn as vector paths. */
function GiftIcon() {
  const stroke = { stroke: colors.greenText, strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <Svg viewBox="0 0 24 24" style={styles.bonusIcon}>
      <Rect x={3} y={7} width={18} height={4} rx={1} {...stroke} />
      <Path d="M12 7v14" {...stroke} />
      <Path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" {...stroke} />
      <Path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5" {...stroke} />
    </Svg>
  );
}

/** Same condition as the website's hero pill: a Udemy link or bonus courses. */
function UdemyBonusCallout({ courses }: { courses: UdemyBonusCourse[] }) {
  return (
    <View style={styles.bonus} wrap={false}>
      <GiftIcon />
      <View style={styles.bonusBody}>
        <Text style={styles.bonusTitle}>Includes a free Udemy course</Text>
        <Text style={styles.bonusText}>Lifetime access on Udemy, included in the course fee.</Text>
        {courses.length > 0 && (
          <Text style={styles.bonusLabel}>{courses.length === 1 ? "Your bonus course" : "Choose one of"}</Text>
        )}
        {courses.map((bonus) => (
          <Text key={bonus.id} style={styles.bonusCourse}>
            <Text style={styles.bonusCourseTitle}>{bonus.title}</Text>
            {` — ${bonus.instructor} · ${bonus.total_hours} · ${bonus.lectures} lectures`}
          </Text>
        ))}
      </View>
    </View>
  );
}

function PdfLesson({ lesson, number, first = false }: { lesson: CourseLesson; number: number; first?: boolean }) {
  return (
    <View style={first ? [styles.lesson, styles.firstLesson] : styles.lesson}>
      <Text style={styles.lessonNumber}>{number}.</Text>
      <View style={styles.lessonBody}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        {lesson.description && <Text style={styles.lessonDescription}>{lesson.description}</Text>}
      </View>
    </View>
  );
}

interface CourseCurriculumPdfProps {
  course: CourseDetail;
  siteName: string;
  /** PNG bytes of the company logo. */
  logo: Buffer;
  generatedAt?: Date;
}

export function CourseCurriculumPdf({
  course,
  siteName,
  logo,
  generatedAt = new Date(),
}: CourseCurriculumPdfProps) {
  const { current, original } = getCoursePricing(course);
  const modules = course.modules;
  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const paragraphs = course.description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const facts = [
    { label: "Duration", value: course.duration },
    { label: "Learning mode", value: learningModeLabels[course.learning_mode] },
    {
      label: "Total fee",
      value: formatPrice(current),
      note: original != null ? `${formatPrice(original)} before discount` : null,
    },
    { label: "Category", value: course.category.name },
    course.certificate_available && { label: "Certificate", value: "Included" },
  ].filter((fact) => !!fact);

  return (
    <Document
      title={`${course.name} — Course Curriculum`}
      author={siteName}
      subject={`${course.name} course curriculum`}
      creator={siteName}
      producer={siteName}
      language="en"
    >
      <Page size="A4" style={styles.page}>
        {/* Fixed elements repeat on every page; declared first so they render on each. */}
        <View style={styles.footer} fixed>
          <Text>
            {siteName} · {course.name}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
          <Image src={{ data: logo, format: "png" }} style={styles.logo} />
          <View style={styles.headerMeta}>
            <Text style={styles.headerLabel}>Course Curriculum</Text>
            <Text style={styles.headerDate}>
              {generatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </View>
        </View>

        <Text style={styles.category}>{course.category.name}</Text>
        <Text style={styles.title}>{course.name}</Text>
        {course.short_description && <Text style={styles.summary}>{course.short_description}</Text>}
        {hasUdemyBonus(course) && <UdemyBonusCallout courses={course.udemy_bonus_courses} />}

        <View style={styles.facts} wrap={false}>
          {facts.map((fact) => (
            <View key={fact.label} style={styles.fact}>
              <Text style={styles.factLabel}>{fact.label}</Text>
              <Text style={styles.factValue}>{fact.value}</Text>
              {"note" in fact && fact.note && <Text style={styles.factNote}>{fact.note}</Text>}
            </View>
          ))}
        </View>

        {/*
          Everything below is a direct child of the page. react-pdf only moves a
          heading to the next page (minPresenceAhead) when it has earlier siblings
          in the same parent, and an unbreakable block taller than a page gets
          clipped. So headings are flat siblings, and nothing that can grow is
          wrap={false}.
        */}
        {paragraphs.length > 0 && (
          <Text style={styles.sectionTitle} minPresenceAhead={40}>
            About this course
          </Text>
        )}
        {paragraphs.map((paragraph, i) => (
          <Text key={i} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}

        <Text style={styles.sectionTitle} minPresenceAhead={80}>
          Course curriculum
        </Text>
        <Text style={styles.sectionMeta}>
          {modules.length} {modules.length === 1 ? "module" : "modules"}
          {lessonCount > 0 && ` · ${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`}
        </Text>

        {modules.map((module, index) => (
          <Fragment key={module.id}>
            {/* Label and title stay together (always short, so safe to keep
                unbroken) and need a few lines after them, so a module heading
                never ends a page alone. */}
            <View style={styles.moduleHeader} wrap={false} minPresenceAhead={36}>
              <Text style={styles.moduleLabel}>Module {index + 1}</Text>
              <Text style={styles.moduleTitle}>{module.title}</Text>
            </View>
            {module.description && (
              <View style={styles.moduleDescriptionRow}>
                <Text style={styles.moduleDescription}>{module.description}</Text>
              </View>
            )}
            {module.lessons.map((lesson, i) => (
              <PdfLesson key={lesson.id} lesson={lesson} number={i + 1} first={i === 0} />
            ))}
          </Fragment>
        ))}

      </Page>
    </Document>
  );
}
