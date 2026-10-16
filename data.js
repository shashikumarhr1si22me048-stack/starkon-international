
"use strict";

const initialNewsStories = [
  {
    id: "sample-karnataka",
    category: "Karnataka",
    headline: "Understanding Local Development in Karnataka",
    summary: "Explore how infrastructure, education, technology and public services can influence development across Karnataka.",
    imageUrl: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Indian city streets and buildings",
    author: "Starkon Editorial Team",
    publishedAt: "2026-10-10T09:00:00+05:30",
    sourceName: "Starkon Educational Sample",
    sourceUrl: null,
    sourceNote: "Educational explainer. This is not a report of a specific verified event.",
    verificationStatus: "Sample content — not independently verified",
    status: "Explainer",
    isBreaking: false,
    paragraphs: [
      "Regional development involves improvements in infrastructure, education, healthcare, employment and public services.",
      "In Karnataka, cities, towns and rural communities can have different development priorities. Roads, reliable public transport, digital connectivity and access to education can influence local opportunities.",
      "Understanding development requires examining reliable data, official announcements and community experiences rather than relying on a single indicator."
    ]
  },
  {
    id: "sample-india-economy",
    category: "India",
    headline: "Understanding India's Economy",
    summary: "Learn how production, consumption, investment, exports and government policy interact in an economy.",
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "The Taj Mahal in India",
    author: "Starkon Editorial Team",
    publishedAt: "2026-10-10T10:00:00+05:30",
    sourceName: "Starkon Educational Sample",
    sourceUrl: null,
    sourceNote: "Educational explainer. Current economic claims should be checked against reliable official data.",
    verificationStatus: "Sample content — not independently verified",
    status: "Explainer",
    isBreaking: false,
    paragraphs: [
      "An economy includes the activities through which people and organisations produce, distribute and consume goods and services.",
      "India's economy includes agriculture, manufacturing, services, technology, construction and many other sectors. Employment, household spending, investment and public expenditure influence economic activity.",
      "To understand current economic performance, compare official statistics over time and consider inflation, employment, productivity and household purchasing power."
    ]
  },
  {
    id: "sample-world",
    category: "World",
    headline: "Why International Relations Matter",
    summary: "Discover how diplomacy, trade, security and international cooperation shape relationships between countries.",
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Government buildings and city architecture",
    author: "Starkon Editorial Team",
    publishedAt: "2026-10-10T11:00:00+05:30",
    sourceName: "Starkon Educational Sample",
    sourceUrl: null,
    sourceNote: "Educational explainer. This is not a report of a specific current geopolitical event.",
    verificationStatus: "Sample content — not independently verified",
    status: "Explainer",
    isBreaking: false,
    paragraphs: [
      "International relations describes how countries and other global actors interact through diplomacy, trade, security, culture and international institutions.",
      "A decision made by one country can affect others through energy prices, supply chains, migration, investment and security arrangements.",
      "Good international reporting distinguishes confirmed events from official claims, expert interpretations and speculation."
    ]
  },
  {
    id: "sample-business",
    category: "Business",
    headline: "How Businesses Create Value",
    summary: "Understand the basics of business models, customers, revenue, costs and sustainable growth.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Business analytics displayed on a computer screen",
    author: "Starkon Editorial Team",
    publishedAt: "2026-10-10T12:00:00+05:30",
    sourceName: "Starkon Educational Sample",
    sourceUrl: null,
    sourceNote: "Educational explainer. No company-specific financial claims are being made.",
    verificationStatus: "Sample content — not independently verified",
    status: "Explainer",
    isBreaking: false,
    paragraphs: [
      "A business creates value by offering a product or service that customers are willing to pay for.",
      "Revenue is the money a business earns from its activities, while costs include the resources required to operate. Profit is generally what remains after relevant expenses are deducted from revenue.",
      "Business performance should be assessed using several measures, including cash flow, profitability, customer demand, debt and the ability to operate sustainably."
    ]
  },
  {
    id: "sample-technology",
    category: "Technology",
    headline: "Understanding Artificial Intelligence",
    summary: "Learn what artificial intelligence can do, where it is useful and why human oversight remains important.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Artificial intelligence concept artwork",
    author: "Starkon Editorial Team",
    publishedAt: "2026-10-10T13:00:00+05:30",
    sourceName: "Starkon Educational Sample",
    sourceUrl: null,
    sourceNote: "Educational explainer. This article does not announce a specific new AI product or research result.",
    verificationStatus: "Sample content — not independently verified",
    status: "Explainer",
    isBreaking: false,
    paragraphs: [
      "Artificial intelligence refers to computer systems designed to perform tasks that commonly require capabilities such as recognising patterns, understanding language or making predictions.",
      "AI systems can support research, accessibility, software development, manufacturing and many other activities. Their performance depends on the task, data, design and operating conditions.",
      "AI outputs can contain errors or reflect limitations in their training data. Important decisions require appropriate human review, testing and attention to privacy and security."
    ]
  },
  {
    id: "sample-sports",
    category: "Sports",
    headline: "How Sports Analytics Works",
    summary: "Explore how performance data can help teams evaluate tactics, training and player performance.",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Athletes running on a track",
    author: "Starkon Editorial Team",
    publishedAt: "2026-10-10T14:00:00+05:30",
    sourceName: "Starkon Educational Sample",
    sourceUrl: null,
    sourceNote: "Educational explainer. This is not a report of a particular match or athlete.",
    verificationStatus: "Sample content — not independently verified",
    status: "Explainer",
    isBreaking: false,
    paragraphs: [
      "Sports analytics uses recorded observations and statistical methods to study performance, tactics and decision-making.",
      "Depending on the sport, analysts may examine scoring opportunities, passing accuracy, movement, workload or defensive positioning.",
      "Statistics can help explain performance, but match context, injuries, teamwork and uncertainty also matter when interpreting results."
    ]
  }
];

const STARKON_STORAGE_KEY = "starkonInternationalLocalStories";

function loadStarkonSavedStories() {
  try {
    const storedValue = localStorage.getItem(STARKON_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((story) => {
      return (
        story &&
        typeof story === "object" &&
        typeof story.id === "string" &&
        story.id.startsWith("local-story-") &&
        typeof story.headline === "string" &&
        typeof story.summary === "string" &&
        typeof story.category === "string" &&
        Array.isArray(story.paragraphs)
      );
    });
  } catch (error) {
    console.error("Starkon International could not load saved stories:", error);
    return [];
  }
}

function saveStarkonEditorStories(stories) {
  try {
    const localStories = stories.filter((story) => {
      return (
        story &&
        typeof story.id === "string" &&
        story.id.startsWith("local-story-")
      );
    });

    localStorage.setItem(
      STARKON_STORAGE_KEY,
      JSON.stringify(localStories)
    );

    return true;
  } catch (error) {
    console.error("Starkon International could not save stories:", error);
    return false;
  }
}
