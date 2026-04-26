export type SeoPageSlug =
  | "about"
  | "features"
  | "compare"
  | "habitTracker"
  | "dailyHabitTracker"
  | "routineTracker"
  | "streakTracker"
  | "simpleHabitTracker";

export type SeoPageLink = {
  href: string;
  label: string;
};

export type SeoPageSection = {
  eyebrow: string;
  title: string;
  body: string;
  bullets?: string[];
};

export type SeoPageFeature = {
  title: string;
  body: string;
};

export type SeoPageFaq = {
  question: string;
  answer: string;
};

export type SeoComparisonTable = {
  columns: string[];
  rows: Array<{
    label: string;
    cells: string[];
  }>;
  note: string;
};

export type SeoPage = {
  slug: SeoPageSlug;
  path: string;
  navLabel: string;
  routeTitle: string;
  routeDescription: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  priority: number;
  changeFrequency: "weekly" | "monthly";
  lastModified: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  heroImageAlt: string;
  primaryCta: SeoPageLink;
  secondaryCta: SeoPageLink;
  proofPoints: SeoPageFeature[];
  sections: SeoPageSection[];
  featureGrid: SeoPageFeature[];
  comparison?: SeoComparisonTable;
  faqs: SeoPageFaq[];
  relatedSlugs: SeoPageSlug[];
};

export const SEO_PAGE_LAST_MODIFIED = "2026-04-25T00:00:00.000Z";

export const SEO_PAGES: SeoPage[] = [
  {
    slug: "about",
    path: "/about",
    navLabel: "About",
    routeTitle: "About ImproTrack",
    routeDescription:
      "Learn what ImproTrack is, why it exists, and how the habit tracker keeps routines, streaks, stats, and archives focused.",
    metaTitle: "About the Habit Tracker App",
    metaDescription:
      "Learn how ImproTrack helps you build routines with daily check-ins, streaks, stats, archive history, Google sync, and an installable app.",
    keywords: [
      "about ImproTrack",
      "habit tracker app",
      "routine tracker",
      "daily habits app",
    ],
    priority: 0.7,
    changeFrequency: "monthly",
    lastModified: SEO_PAGE_LAST_MODIFIED,
    eyebrow: "About ImproTrack",
    heroTitle:
      "A habit tracker app for routines you can actually keep repeating.",
    heroDescription:
      "ImproTrack is built for people who want a calm place to record daily habits, understand consistency, and keep old routines available without turning habit tracking into another noisy task list.",
    heroImage: "/brand/dashboard-shot.png",
    heroImageAlt:
      "ImproTrack dashboard showing daily habit rows, check-ins, and progress summaries",
    primaryCta: { href: "/dashboard", label: "Open dashboard" },
    secondaryCta: { href: "/features", label: "Explore features" },
    proofPoints: [
      {
        title: "Daily habit tracking",
        body: "Fast check-ins for once-a-day habits and routines with multiple slots.",
      },
      {
        title: "Progress that stays readable",
        body: "Streaks, completion rates, weekday rhythm, and trend history in one focused view.",
      },
      {
        title: "Built around continuity",
        body: "Archive habits when life changes, then restore them without losing their record.",
      },
    ],
    sections: [
      {
        eyebrow: "Purpose",
        title: "ImproTrack exists because habit building needs less noise.",
        body: "Many productivity tools mix projects, reminders, notes, timers, and social pressure into the same screen. ImproTrack keeps the product narrow: choose the habits that matter, mark what happened, and review the signal when you need it.",
        bullets: [
          "Create habits with names, descriptions, colors, and goals.",
          "Use multi-slot routines for morning, afternoon, evening, or custom check-ins.",
          "Keep the dashboard focused on today without losing long-term context.",
        ],
      },
      {
        eyebrow: "Product approach",
        title: "The app favors clarity over gamified pressure.",
        body: "ImproTrack shows progress, but it does not need every habit to become a competition. The dashboard gives you enough feedback to notice drift, rebuild consistency, and make better decisions about your routine.",
      },
      {
        eyebrow: "Data flow",
        title: "Your tracker can follow you across devices.",
        body: "Google sign-in keeps habits and records connected to your account, while the installable web app surface keeps the dashboard close on supported devices.",
      },
    ],
    featureGrid: [
      {
        title: "Dashboard",
        body: "A readable matrix for today, recent days, and each habit in your routine.",
      },
      {
        title: "Statistics",
        body: "Completion rates, streaks, leaderboard views, and weekday patterns.",
      },
      {
        title: "Archive",
        body: "Pause habits without deleting the history that explains your progress.",
      },
      {
        title: "PWA support",
        body: "Install ImproTrack on supported devices for a focused app-like workspace.",
      },
    ],
    faqs: [
      {
        question: "What is ImproTrack?",
        answer:
          "ImproTrack is a habit tracker app for creating routines, recording daily check-ins, reviewing stats, and keeping old habits archived for later context.",
      },
      {
        question: "Who is ImproTrack for?",
        answer:
          "It is for people who want a focused habit tracker without turning daily follow-through into a complicated project management system.",
      },
    ],
    relatedSlugs: ["features", "compare", "habitTracker"],
  },
  {
    slug: "features",
    path: "/features",
    navLabel: "Features",
    routeTitle: "Habit Tracker Features",
    routeDescription:
      "See the ImproTrack features for daily habits, routine slots, streak analytics, archive history, sync, and installable PWA access.",
    metaTitle: "Habit Tracker Features for Daily Routines",
    metaDescription:
      "Explore ImproTrack features: daily habit dashboard, streak stats, multi-slot routines, archive history, Google sync, and installable PWA access.",
    keywords: [
      "habit tracker features",
      "daily habit dashboard",
      "streak tracker",
      "routine tracking features",
    ],
    priority: 0.85,
    changeFrequency: "weekly",
    lastModified: SEO_PAGE_LAST_MODIFIED,
    eyebrow: "Features",
    heroTitle:
      "Habit tracker features for daily routines, streaks, and progress review.",
    heroDescription:
      "ImproTrack gives each routine a clean place to live: a dashboard for check-ins, stats for reflection, and an archive for habits you want to pause without erasing.",
    heroImage: "/brand/stats-shot.png",
    heroImageAlt:
      "ImproTrack statistics page showing completion trends and habit streak summaries",
    primaryCta: { href: "/dashboard", label: "Try the dashboard" },
    secondaryCta: { href: "/compare", label: "Compare trackers" },
    proofPoints: [
      {
        title: "Fast daily check-ins",
        body: "Open the board, mark the habit, and move on with the day.",
      },
      {
        title: "Flexible routine slots",
        body: "Track simple habits or split routines into several parts of the day.",
      },
      {
        title: "Stats with context",
        body: "See streaks, rates, trends, and weekday rhythm without spreadsheet work.",
      },
    ],
    sections: [
      {
        eyebrow: "Dashboard",
        title: "A habit matrix built for quick scanning.",
        body: "The dashboard keeps active habits, recent days, slot progress, and completion state in one view. It is designed for repeated use, so the important action stays obvious every time you open it.",
        bullets: [
          "Tap cells to record completed or missed check-ins.",
          "Reorder routines so the most important habits stay easy to reach.",
          "Open habit detail views when you need deeper history.",
        ],
      },
      {
        eyebrow: "Analytics",
        title: "Progress stats help you see the pattern behind the checkmark.",
        body: "Stats show completion rate, streaks, habit rankings, daily trend, and weekday rhythm, making it easier to spot when a routine is supported by your real schedule.",
      },
      {
        eyebrow: "Lifecycle",
        title: "Archive routines instead of deleting your context.",
        body: "Some habits are seasonal. Some are complete. Some need a break. The archive keeps old routines out of the active board while preserving the history you may want later.",
      },
    ],
    featureGrid: [
      {
        title: "Multi-slot habits",
        body: "Track routines that happen more than once per day with custom slot labels.",
      },
      {
        title: "Habit detail pages",
        body: "Review a single habit's streaks, monthly trend, and weekday pattern.",
      },
      {
        title: "Account sync",
        body: "Sign in with Google to keep your habit data attached to your account.",
      },
      {
        title: "Theme support",
        body: "Use light or dark mode across the public pages and dashboard surfaces.",
      },
      {
        title: "Offline fallback",
        body: "Previously cached public and app surfaces can still open when connection drops.",
      },
      {
        title: "Installable app",
        body: "Use supported browser install flows for faster return visits.",
      },
    ],
    faqs: [
      {
        question: "Can ImproTrack handle habits more than once a day?",
        answer:
          "Yes. Multi-slot habits let a routine have separate check-ins, such as morning and evening, while still belonging to the same habit.",
      },
      {
        question: "Does ImproTrack show long-term progress?",
        answer:
          "Yes. The stats and habit detail views show streaks, completion rates, monthly trends, and weekday patterns when enough history is available.",
      },
    ],
    relatedSlugs: ["habitTracker", "dailyHabitTracker", "routineTracker"],
  },
  {
    slug: "compare",
    path: "/compare",
    navLabel: "Compare",
    routeTitle: "Compare Habit Tracker Apps",
    routeDescription:
      "Compare ImproTrack with to-do lists, spreadsheets, gamified trackers, and all-in-one productivity apps by focus, speed, stats, and archive history.",
    metaTitle: "Compare Habit Tracker Apps",
    metaDescription:
      "Compare ImproTrack with other habit tracker app styles: to-do lists, spreadsheets, gamified trackers, and all-in-one productivity tools.",
    keywords: [
      "compare habit tracker apps",
      "habit tracker comparison",
      "best habit tracker app",
      "habit tracker alternatives",
    ],
    priority: 0.8,
    changeFrequency: "monthly",
    lastModified: SEO_PAGE_LAST_MODIFIED,
    eyebrow: "Comparison",
    heroTitle: "Compare ImproTrack with other habit tracker app styles.",
    heroDescription:
      "Some trackers are task lists, some are spreadsheets, some lean on streak pressure, and some bundle habits into a broad productivity suite. ImproTrack is focused on check-ins, routine clarity, and readable progress.",
    heroImage: "/brand/global-statistic.png",
    heroImageAlt:
      "ImproTrack global statistics page showing completion summaries and progress signals",
    primaryCta: { href: "/dashboard", label: "Open ImproTrack" },
    secondaryCta: { href: "/features", label: "View features" },
    proofPoints: [
      {
        title: "Narrow by design",
        body: "ImproTrack focuses on habits rather than trying to replace every productivity tool.",
      },
      {
        title: "Stats without setup",
        body: "Progress views are built in, so you do not need formulas or manual charts.",
      },
      {
        title: "Good fit for routines",
        body: "Multi-slot check-ins make repeated daily routines easier to represent.",
      },
    ],
    sections: [
      {
        eyebrow: "Positioning",
        title: "ImproTrack is not trying to be every tracker.",
        body: "The product is strongest when you want a direct habit dashboard with enough analytics to understand follow-through. If you need team project management, deep journaling, or heavy automation, a broader tool may be a better match.",
      },
      {
        eyebrow: "Decision guide",
        title: "Choose the tool that matches how you actually review progress.",
        body: "A to-do list is useful when habits are mixed into daily errands. A spreadsheet is useful when you want full control. ImproTrack is useful when you want a dedicated habit board that already understands streaks, slots, history, and archives.",
      },
    ],
    featureGrid: [
      {
        title: "Compared with to-do lists",
        body: "ImproTrack keeps recurring habits from getting buried under one-off tasks.",
      },
      {
        title: "Compared with spreadsheets",
        body: "ImproTrack gives you habit stats without building formulas or maintaining tabs.",
      },
      {
        title: "Compared with streak-only apps",
        body: "ImproTrack keeps archive history and trend context around the streak.",
      },
      {
        title: "Compared with all-in-one tools",
        body: "ImproTrack stays quieter when you only need routine tracking.",
      },
    ],
    comparison: {
      columns: [
        "ImproTrack",
        "To-do list apps",
        "Spreadsheet trackers",
        "Gamified trackers",
      ],
      rows: [
        {
          label: "Primary focus",
          cells: [
            "Daily habits, routines, streaks, stats, and archive history",
            "Tasks, errands, reminders, and personal workload",
            "Custom logging, formulas, and manual reporting",
            "Motivation loops, badges, streak pressure, and rewards",
          ],
        },
        {
          label: "Daily check-in speed",
          cells: [
            "Designed around a repeatable habit matrix",
            "Often mixed with non-habit tasks",
            "Depends on the spreadsheet layout you maintain",
            "Usually fast, but may emphasize prompts or reward screens",
          ],
        },
        {
          label: "Progress review",
          cells: [
            "Built-in stats, completion rates, streaks, and weekday rhythm",
            "Often limited unless paired with another system",
            "Powerful if you build and maintain the formulas",
            "Often focused on streaks and motivation feedback",
          ],
        },
        {
          label: "Routine flexibility",
          cells: [
            "Supports once-a-day and multi-slot habits",
            "Can repeat tasks, but routine history may be fragmented",
            "Fully customizable, but more manual",
            "Varies by app and habit model",
          ],
        },
        {
          label: "Best fit",
          cells: [
            "People who want a calm dedicated habit tracker",
            "People who want habits mixed with general task planning",
            "People who want maximum control and do not mind setup",
            "People who respond well to game-like motivation",
          ],
        },
      ],
      note: "This comparison is category-based. It avoids naming competitors because app features change and the right choice depends on your workflow.",
    },
    faqs: [
      {
        question: "Is ImproTrack better than a to-do list for habits?",
        answer:
          "It depends on your workflow. ImproTrack is stronger when you want habits separated from one-off tasks and reviewed as routines over time.",
      },
      {
        question: "Is ImproTrack a replacement for spreadsheets?",
        answer:
          "ImproTrack replaces the common habit-tracking spreadsheet workflow for people who want built-in check-ins and stats. A spreadsheet is still better if you need custom formulas or unusual reporting.",
      },
    ],
    relatedSlugs: ["features", "simpleHabitTracker", "streakTracker"],
  },
  {
    slug: "habitTracker",
    path: "/habit-tracker",
    navLabel: "Habit tracker",
    routeTitle: "Habit Tracker App",
    routeDescription:
      "A focused habit tracker app for daily routines, check-ins, streaks, progress stats, and archive history.",
    metaTitle: "Habit Tracker App for Daily Routines",
    metaDescription:
      "Use ImproTrack as a habit tracker app for daily check-ins, routine slots, streaks, progress stats, archives, and synced habit history.",
    keywords: [
      "habit tracker",
      "habit tracker app",
      "daily habit tracker",
      "online habit tracker",
    ],
    priority: 0.9,
    changeFrequency: "weekly",
    lastModified: SEO_PAGE_LAST_MODIFIED,
    eyebrow: "Habit tracker app",
    heroTitle: "A habit tracker app for daily routines and visible progress.",
    heroDescription:
      "ImproTrack helps you create habits, check them off, and see whether your routine is getting stronger over time. It is simple enough for daily use and structured enough for meaningful review.",
    heroImage: "/brand/dashboard-shot.png",
    heroImageAlt:
      "ImproTrack habit tracker dashboard with active habits and recent check-ins",
    primaryCta: { href: "/dashboard", label: "Start tracking habits" },
    secondaryCta: { href: "/daily-habit-tracker", label: "Daily tracker page" },
    proofPoints: [
      {
        title: "Create",
        body: "Add habits with names, goals, colors, and optional descriptions.",
      },
      {
        title: "Check in",
        body: "Record completion from the dashboard without opening a complex workflow.",
      },
      {
        title: "Review",
        body: "Use stats to understand consistency instead of guessing from memory.",
      },
    ],
    sections: [
      {
        eyebrow: "Daily use",
        title: "The habit board keeps the next action obvious.",
        body: "A good habit tracker should be easy to return to. ImproTrack keeps active routines visible, makes check-ins fast, and keeps deeper review one click away.",
      },
      {
        eyebrow: "Progress",
        title: "Stats turn repeated check-ins into useful feedback.",
        body: "Completion rate, streaks, weekday rhythm, and habit rankings help you see where the system is working and where a routine may need a smaller step.",
      },
      {
        eyebrow: "Continuity",
        title: "The archive protects your history as routines change.",
        body: "When a habit no longer belongs on the active dashboard, you can archive it instead of deleting the context that explains your long-term progress.",
      },
    ],
    featureGrid: [
      {
        title: "Habit dashboard",
        body: "A focused grid for current routines and recent completion.",
      },
      {
        title: "Streak tracking",
        body: "See current streaks and strongest runs for each habit.",
      },
      {
        title: "Routine slots",
        body: "Track habits that happen once or several times per day.",
      },
      {
        title: "Progress stats",
        body: "Review trends without managing your own spreadsheet.",
      },
    ],
    faqs: [
      {
        question: "What makes a good habit tracker app?",
        answer:
          "A good habit tracker should make daily check-ins quick, keep routines easy to understand, and show enough progress data to help you adjust without overwhelming you.",
      },
      {
        question: "Can I use ImproTrack as an online habit tracker?",
        answer:
          "Yes. ImproTrack is a web app with Google sign-in for synced habit data and an installable PWA experience on supported devices.",
      },
    ],
    relatedSlugs: ["features", "dailyHabitTracker", "compare"],
  },
  {
    slug: "dailyHabitTracker",
    path: "/daily-habit-tracker",
    navLabel: "Daily habits",
    routeTitle: "Daily Habit Tracker",
    routeDescription:
      "A daily habit tracker for fast check-ins, simple routines, streaks, and progress review.",
    metaTitle: "Daily Habit Tracker for Fast Check-ins",
    metaDescription:
      "Track daily habits with ImproTrack: quick check-ins, multi-slot routines, streaks, completion rates, and a calm dashboard for repeat use.",
    keywords: [
      "daily habit tracker",
      "daily routine tracker",
      "habit check-in app",
      "daily habits app",
    ],
    priority: 0.78,
    changeFrequency: "weekly",
    lastModified: SEO_PAGE_LAST_MODIFIED,
    eyebrow: "Daily habit tracker",
    heroTitle: "A daily habit tracker that keeps check-ins quick.",
    heroDescription:
      "ImproTrack is built for the small daily moment when you record whether the habit happened. The dashboard stays readable so the tracker does not become harder than the routine.",
    heroImage: "/brand/dashboard-shot.png",
    heroImageAlt:
      "ImproTrack daily habit tracker dashboard showing check-in cells for recent days",
    primaryCta: { href: "/dashboard", label: "Open daily tracker" },
    secondaryCta: { href: "/habit-tracker", label: "Habit tracker overview" },
    proofPoints: [
      {
        title: "One glance",
        body: "See active habits and recent check-ins without digging through menus.",
      },
      {
        title: "One action",
        body: "Mark completion from the tracker surface and get back to the day.",
      },
      {
        title: "One history",
        body: "Keep the daily record available for stats and habit detail pages.",
      },
    ],
    sections: [
      {
        eyebrow: "Check-ins",
        title: "Daily tracking works best when the habit entry is frictionless.",
        body: "ImproTrack keeps the check-in interaction simple and repeatable. That makes it easier to use the tracker at the same moment each day.",
      },
      {
        eyebrow: "Review",
        title: "Daily data becomes more useful when it is grouped into trends.",
        body: "After enough check-ins, the stats page helps you see completion rate, streaks, and weekday rhythm. The point is not perfection. The point is knowing what your routine is doing.",
      },
    ],
    featureGrid: [
      {
        title: "Daily board",
        body: "Track each active habit against the current day and recent history.",
      },
      {
        title: "Custom habit colors",
        body: "Keep routines visually distinct so scanning stays easy.",
      },
      {
        title: "Habit details",
        body: "Open one habit to inspect streaks, totals, and trends.",
      },
      {
        title: "Archive support",
        body: "Move old routines out of the daily board without deleting them.",
      },
    ],
    faqs: [
      {
        question: "Can a daily habit tracker help with consistency?",
        answer:
          "It can help by making the behavior visible. ImproTrack shows what happened each day so you can adjust the routine based on evidence instead of memory.",
      },
      {
        question: "Do daily habits need to be completed every day?",
        answer:
          "No. The tracker records reality. The useful part is noticing patterns, choosing the next adjustment, and continuing with a routine that fits your life.",
      },
    ],
    relatedSlugs: ["habitTracker", "routineTracker", "streakTracker"],
  },
  {
    slug: "routineTracker",
    path: "/routine-tracker",
    navLabel: "Routine tracker",
    routeTitle: "Routine Tracker",
    routeDescription:
      "Track morning, evening, and multi-slot routines with a focused habit dashboard and progress stats.",
    metaTitle: "Routine Tracker for Morning and Evening Habits",
    metaDescription:
      "Use ImproTrack as a routine tracker for morning habits, evening routines, multi-slot check-ins, streaks, and progress review.",
    keywords: [
      "routine tracker",
      "morning routine tracker",
      "evening routine tracker",
      "daily routine app",
    ],
    priority: 0.76,
    changeFrequency: "weekly",
    lastModified: SEO_PAGE_LAST_MODIFIED,
    eyebrow: "Routine tracker",
    heroTitle: "A routine tracker for habits that happen in real life.",
    heroDescription:
      "Some routines happen once. Others have parts: morning, workout, reading, medication, evening reset. ImproTrack can track simple habits and multi-slot routines side by side.",
    heroImage: "/brand/stats-shot.png",
    heroImageAlt:
      "ImproTrack routine tracker statistics showing progress across selected habits",
    primaryCta: { href: "/dashboard", label: "Track a routine" },
    secondaryCta: { href: "/features", label: "See feature details" },
    proofPoints: [
      {
        title: "Multiple slots",
        body: "Represent routines that happen more than once per day.",
      },
      {
        title: "Custom labels",
        body: "Name slots around your schedule instead of forcing a generic model.",
      },
      {
        title: "Routine history",
        body: "Review how the routine performs over time, not only today.",
      },
    ],
    sections: [
      {
        eyebrow: "Flexible habits",
        title: "A routine can be one check-in or several.",
        body: "ImproTrack lets simple daily habits and multi-step routines live in the same dashboard. That matters when your real routine is not just yes or no.",
      },
      {
        eyebrow: "Schedule fit",
        title: "Weekday rhythm shows where the routine has support.",
        body: "Stats can reveal which days are strongest and which days need a smaller commitment, different timing, or a different habit design.",
      },
    ],
    featureGrid: [
      {
        title: "Morning routines",
        body: "Track the first actions that set up the rest of the day.",
      },
      {
        title: "Evening routines",
        body: "Give closing habits their own check-ins and review pattern.",
      },
      {
        title: "Health routines",
        body: "Use slots for recurring wellness tasks that happen through the day.",
      },
      {
        title: "Learning routines",
        body: "Track reading, study, practice, or skill work with simple feedback.",
      },
    ],
    faqs: [
      {
        question: "What is the difference between a habit tracker and a routine tracker?",
        answer:
          "A habit tracker records repeated behaviors. A routine tracker often groups several repeated behaviors or repeated moments. ImproTrack supports both with simple and multi-slot habits.",
      },
      {
        question: "Can I track morning and evening routines separately?",
        answer:
          "Yes. You can create separate habits for each routine or use multi-slot habits when the same routine needs more than one check-in per day.",
      },
    ],
    relatedSlugs: ["dailyHabitTracker", "features", "simpleHabitTracker"],
  },
  {
    slug: "streakTracker",
    path: "/streak-tracker",
    navLabel: "Streak tracker",
    routeTitle: "Streak Tracker",
    routeDescription:
      "A streak tracker for habits that pairs current runs with completion rates, weekday rhythm, and archived history.",
    metaTitle: "Streak Tracker for Habits and Routines",
    metaDescription:
      "Track habit streaks with ImproTrack and review the context behind them: completion rates, weekday rhythm, trends, and routine history.",
    keywords: [
      "streak tracker",
      "habit streak tracker",
      "daily streak tracker",
      "routine streak app",
    ],
    priority: 0.74,
    changeFrequency: "weekly",
    lastModified: SEO_PAGE_LAST_MODIFIED,
    eyebrow: "Streak tracker",
    heroTitle: "A streak tracker that keeps context around consistency.",
    heroDescription:
      "Streaks are useful, but they are not the whole story. ImproTrack shows current runs alongside completion rates, trends, and weekday patterns so one missed day does not erase the signal.",
    heroImage: "/brand/stats-shot.png",
    heroImageAlt:
      "ImproTrack streak tracker stats with trend charts and habit leaderboard",
    primaryCta: { href: "/dashboard", label: "Track streaks" },
    secondaryCta: { href: "/compare", label: "Compare tracker styles" },
    proofPoints: [
      {
        title: "Current runs",
        body: "See the live streak for each active habit.",
      },
      {
        title: "Best streaks",
        body: "Compare current consistency with your strongest historical runs.",
      },
      {
        title: "More than streaks",
        body: "Use rates and trends to understand progress even after a break.",
      },
    ],
    sections: [
      {
        eyebrow: "Healthy feedback",
        title: "A streak should motivate without hiding the rest of the pattern.",
        body: "ImproTrack treats streaks as one useful signal. Completion rate, daily trend, and weekday rhythm help you understand whether a habit is stable, fragile, or blocked by schedule.",
      },
      {
        eyebrow: "Recovery",
        title: "Missed days are data, not a reason to abandon the routine.",
        body: "When a streak breaks, the rest of the history still matters. ImproTrack keeps the longer record available so you can restart with context.",
      },
    ],
    featureGrid: [
      {
        title: "Live streaks",
        body: "See active habit streaks directly in the dashboard and stats views.",
      },
      {
        title: "Best runs",
        body: "Know when a current routine is approaching a previous high point.",
      },
      {
        title: "Completion rates",
        body: "Balance streak thinking with a broader view of consistency.",
      },
      {
        title: "Archive history",
        body: "Keep the record for habits that are no longer active.",
      },
    ],
    faqs: [
      {
        question: "Is a streak tracker enough for habit building?",
        answer:
          "A streak tracker is useful, but stronger when paired with completion rates and trend context. ImproTrack includes both so progress is not reduced to a single number.",
      },
      {
        question: "What happens when a streak breaks?",
        answer:
          "The missed day remains part of the record. You can continue tracking, review the broader pattern, and adjust the routine if needed.",
      },
    ],
    relatedSlugs: ["habitTracker", "dailyHabitTracker", "compare"],
  },
  {
    slug: "simpleHabitTracker",
    path: "/simple-habit-tracker",
    navLabel: "Simple tracker",
    routeTitle: "Simple Habit Tracker",
    routeDescription:
      "A simple habit tracker for people who want quick daily check-ins, readable stats, and fewer distractions.",
    metaTitle: "Simple Habit Tracker without Extra Noise",
    metaDescription:
      "ImproTrack is a simple habit tracker for quick check-ins, calm routine tracking, readable stats, archive history, and synced progress.",
    keywords: [
      "simple habit tracker",
      "minimal habit tracker",
      "easy habit tracker",
      "simple routine tracker",
    ],
    priority: 0.72,
    changeFrequency: "monthly",
    lastModified: SEO_PAGE_LAST_MODIFIED,
    eyebrow: "Simple habit tracker",
    heroTitle: "A simple habit tracker without extra noise.",
    heroDescription:
      "ImproTrack keeps the public site short and the product direct. You get a habit dashboard, progress views, archive history, and account sync without turning routine tracking into a busy workspace.",
    heroImage: "/brand/dashboard-shot.png",
    heroImageAlt:
      "ImproTrack simple habit tracker board with clear rows and completion cells",
    primaryCta: { href: "/dashboard", label: "Open simple tracker" },
    secondaryCta: { href: "/about", label: "About ImproTrack" },
    proofPoints: [
      {
        title: "Less setup",
        body: "Create the habit and start tracking from the dashboard.",
      },
      {
        title: "Less clutter",
        body: "Keep habits separate from projects, tasks, and unrelated notes.",
      },
      {
        title: "Less guessing",
        body: "Use stats when you want evidence about what is working.",
      },
    ],
    sections: [
      {
        eyebrow: "Simplicity",
        title: "Simple does not have to mean shallow.",
        body: "ImproTrack keeps daily tracking straightforward while still preserving the history needed for useful progress review.",
      },
      {
        eyebrow: "Focus",
        title: "The app is intentionally narrower than a productivity suite.",
        body: "A dedicated habit tracker can be easier to return to because every screen supports the same job: record routines and understand consistency.",
      },
    ],
    featureGrid: [
      {
        title: "Clean habit board",
        body: "A compact place for current habits and recent check-ins.",
      },
      {
        title: "Readable progress",
        body: "Stats are organized for scanning, not over-analysis.",
      },
      {
        title: "Practical archive",
        body: "Move old habits aside while keeping their history.",
      },
      {
        title: "Installable access",
        body: "Keep the tracker close on supported devices.",
      },
    ],
    faqs: [
      {
        question: "Is ImproTrack a minimal habit tracker?",
        answer:
          "ImproTrack is minimal in daily use, but it still includes progress stats, archive history, account sync, and multi-slot habits for routines that need more structure.",
      },
      {
        question: "Can I start with just one habit?",
        answer:
          "Yes. ImproTrack works well for one habit, a small set of daily routines, or a larger tracker once you know what you want to measure.",
      },
    ],
    relatedSlugs: ["dailyHabitTracker", "routineTracker", "features"],
  },
];

export const SEO_PAGES_BY_SLUG = SEO_PAGES.reduce(
  (pages, page) => {
    pages[page.slug] = page;
    return pages;
  },
  {} as Record<SeoPageSlug, SeoPage>,
);
