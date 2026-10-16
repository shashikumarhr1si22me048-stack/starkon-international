
"use strict";

let newsStories = [
  ...loadStarkonSavedStories(),
  ...initialNewsStories
];

let activeCategory = "All";
let searchTerm = "";
let featuredStoryId = newsStories.length ? newsStories[0].id : null;
let revealObserver = null;

const allowedCategories = [
  "Karnataka",
  "India",
  "World",
  "Business",
  "Technology",
  "Sports"
];

document.addEventListener("DOMContentLoaded", initializeWebsite);

function initializeWebsite() {
  setupScrollAnimations();
  setupSearch();
  setupCategoryFilters();
  setupEditor();
  setupBreakingBanner();
  setupExploreButton();

  renderFeaturedStory();
  renderNewsStories();
  renderFullArticles();
  updateFooterYear();

  observeRevealElements(document.querySelectorAll(".content-section"));
}

function getElement(id) {
  return document.getElementById(id);
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

/* Scroll reveal animations */

function setupScrollAnimations() {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -35px 0px"
    }
  );
}

function observeRevealElements(elements) {
  elements.forEach((element) => {
    if (!element || element.classList.contains("is-visible")) {
      return;
    }

    if (!revealObserver) {
      element.classList.add("is-visible");
      return;
    }

    element.classList.add("reveal-on-scroll");
    revealObserver.observe(element);
  });
}

function observeRevealElement(element, delay = 0) {
  if (!element) {
    return;
  }

  if (!revealObserver) {
    element.classList.add("is-visible");
    return;
  }

  element.style.setProperty("--reveal-delay", `${delay}ms`);
  element.classList.add("reveal-on-scroll");
  revealObserver.observe(element);
}

/* Dates */

function formatStoryDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata"
  }).format(date);
}

/* Search and filtering */

function getFilteredStories() {
  return newsStories.filter((story) => {
    const categoryMatches =
      activeCategory === "All" || story.category === activeCategory;

    const searchableText = [
      story.headline,
      story.summary,
      story.category,
      story.author,
      story.sourceName
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return categoryMatches && searchableText.includes(searchTerm);
  });
}

function setupSearch() {
  const form = getElement("news-search-form");
  const input = getElement("news-search");
  const clearButton = getElement("clear-search");

  if (form && input) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      searchTerm = input.value.trim().toLowerCase();
      renderNewsStories();
      renderFullArticles();
    });

    input.addEventListener("input", () => {
      searchTerm = input.value.trim().toLowerCase();
      renderNewsStories();
      renderFullArticles();
    });
  }

  if (clearButton && input) {
    clearButton.addEventListener("click", () => {
      input.value = "";
      searchTerm = "";
      renderNewsStories();
      renderFullArticles();
      input.focus();
    });
  }
}

function setupCategoryFilters() {
  const container = getElement("category-filters");

  if (!container) {
    return;
  }

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");

    if (!button || !container.contains(button)) {
      return;
    }

    activeCategory = button.dataset.category || "All";
    updateCategoryButtons();
    renderNewsStories();
    renderFullArticles();
  });
}

function updateCategoryButtons() {
  document
    .querySelectorAll("#category-filters [data-category]")
    .forEach((button) => {
      const isActive = button.dataset.category === activeCategory;

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
}

function setupExploreButton() {
  const button = getElement("explore-news");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    activeCategory = "All";
    searchTerm = "";

    const input = getElement("news-search");

    if (input) {
      input.value = "";
    }

    updateCategoryButtons();
    renderNewsStories();
    renderFullArticles();
  });
}

/* Images */

function createStoryImage(story) {
  const wrapper = makeElement("div", "story-image-wrapper");

  if (!story.imageUrl) {
    wrapper.appendChild(
      makeElement("div", "image-placeholder", story.category || "STARKON")
    );
    return wrapper;
  }

  const image = document.createElement("img");
  image.src = story.imageUrl;
  image.alt = story.imageAlt || story.headline || "Story image";
  image.loading = "lazy";
  image.decoding = "async";

  image.addEventListener("error", () => {
    wrapper.replaceChildren(
      makeElement(
        "div",
        "image-placeholder",
        `${story.category || "STARKON"} · IMAGE UNAVAILABLE`
      )
    );
  });

  wrapper.appendChild(image);
  return wrapper;
}

/* Story cards */

function createStoryCard(story, index) {
  const card = makeElement("article", "news-card");
  const content = makeElement("div", "news-card-content");

  content.appendChild(
    makeElement("p", "story-category", story.category)
  );

  content.appendChild(
    makeElement("h3", "story-headline", story.headline)
  );

  content.appendChild(
    makeElement("p", "story-summary", story.summary)
  );

  content.appendChild(
    makeElement(
      "p",
      "story-meta",
      `${story.author || "Starkon Editorial Team"} · ${formatStoryDate(story.publishedAt)}`
    )
  );

  const button = makeElement("button", "primary-button", "Read Full Story");
  button.type = "button";

  button.addEventListener("click", () => {
    openFullArticle(story.id);
  });

  content.appendChild(button);
  card.append(createStoryImage(story), content);

  observeRevealElement(card, Math.min(index % 3, 2) * 90);

  return card;
}

function renderNewsStories() {
  const grid = getElement("news-grid");
  const count = getElement("news-results-count");
  const emptyMessage = getElement("no-news-message");

  if (!grid) {
    return;
  }

  const filteredStories = getFilteredStories();
  grid.replaceChildren();

  filteredStories.forEach((story, index) => {
    grid.appendChild(createStoryCard(story, index));
  });

  if (count) {
    count.textContent =
      `${filteredStories.length} ${filteredStories.length === 1 ? "story" : "stories"} found`;
  }

  if (emptyMessage) {
    emptyMessage.hidden = filteredStories.length !== 0;
  }
}

/* Full article reader */

function createFullArticle(story, index) {
  const article = makeElement("article", "full-article");
  article.id = `article-${story.id}`;

  article.appendChild(
    makeElement("p", "story-category", story.category)
  );

  article.appendChild(
    makeElement("h3", "", story.headline)
  );

  article.appendChild(
    makeElement("p", "full-article-summary", story.summary)
  );

  article.appendChild(
    makeElement(
      "p",
      "story-meta",
      `By ${story.author || "Starkon Editorial Team"} · ${formatStoryDate(story.publishedAt)}`
    )
  );

  article.appendChild(
    makeElement(
      "p",
      "article-verification",
      story.verificationStatus || "Verification status not supplied"
    )
  );

  if (story.imageUrl) {
    article.appendChild(createStoryImage(story));
  }

  if (Array.isArray(story.paragraphs)) {
    story.paragraphs.forEach((paragraph) => {
      article.appendChild(
        makeElement("p", "article-paragraph", paragraph)
      );
    });
  }

  article.appendChild(
    makeElement(
      "p",
      "article-source",
      story.sourceNote || "No external source has been recorded."
    )
  );

  if (story.sourceUrl) {
    try {
      const url = new URL(story.sourceUrl);

      if (url.protocol === "https:" || url.protocol === "http:") {
        const link = makeElement("a", "source-link", "View original source");
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        article.appendChild(link);
      }
    } catch (error) {
      console.warn("Invalid source URL for story:", story.id);
    }
  }

  return article;
}

function renderFullArticles() {
  const container = getElement("full-articles");

  if (!container) {
    return;
  }

  container.replaceChildren();

  getFilteredStories().forEach((story, index) => {
    const article = createFullArticle(story, index);

    // Add the article to the page before observing it.
    container.appendChild(article);

    // Reveal the article safely after it has been inserted.
    observeRevealElement(article, Math.min(index % 2, 1) * 80);
  });
}

function openFullArticle(storyId) {
  const exists = newsStories.some((story) => story.id === storyId);

  if (!exists) {
    return;
  }

  const targetId = `article-${storyId}`;
  let target = getElement(targetId);

  if (!target) {
    activeCategory = "All";
    searchTerm = "";

    const input = getElement("news-search");

    if (input) {
      input.value = "";
    }

    updateCategoryButtons();
    renderNewsStories();
    renderFullArticles();
    target = getElement(targetId);
  }

  if (target) {
    target.classList.add("is-visible");
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start"
    });
  }
}

/* Featured story */

function renderFeaturedStory() {
  const container = getElement("featured-story");

  if (!container) {
    return;
  }

  const story =
    newsStories.find((item) => item.id === featuredStoryId) ||
    newsStories[0];

  container.replaceChildren();

  if (!story) {
    container.appendChild(
      makeElement("p", "empty-message", "No featured story is available.")
    );
    return;
  }

  const card = makeElement("article", "featured-story-card");
  const content = makeElement("div", "featured-story-content");

  content.appendChild(
    makeElement("p", "story-category", story.category)
  );

  content.appendChild(
    makeElement("h3", "featured-story-headline", story.headline)
  );

  content.appendChild(
    makeElement("p", "featured-story-summary", story.summary)
  );

  content.appendChild(
    makeElement(
      "p",
      "story-meta",
      `${story.author || "Starkon Editorial Team"} · ${formatStoryDate(story.publishedAt)}`
    )
  );

  const button = makeElement("button", "primary-button", "Read Featured Story");
  button.type = "button";
  button.addEventListener("click", () => openFullArticle(story.id));

  content.appendChild(button);
  card.append(createStoryImage(story), content);
  container.appendChild(card);

  observeRevealElement(card);
}

/* Breaking notice */

function setupBreakingBanner() {
  const button = getElement("breaking-toggle");
  const text = getElement("breaking-text");
  const banner = document.querySelector(".breaking-banner");

  if (!button || !text || !banner) {
    return;
  }

  button.addEventListener("click", () => {
    const isCurrentlyHidden = text.hidden;

    text.hidden = !isCurrentlyHidden;
    banner.classList.toggle("notice-hidden", !isCurrentlyHidden);
    button.textContent = isCurrentlyHidden ? "Hide notice" : "Show notice";
    button.setAttribute("aria-expanded", String(isCurrentlyHidden));
  });
}

/* Article editor and browser storage */

function setupEditor() {
  const form = getElement("article-editor-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const headline = getElement("editor-headline").value.trim();
    const category = getElement("editor-category").value;
    const summary = getElement("editor-summary").value.trim();
    const body = getElement("editor-body").value.trim();
    const imageUrl = getElement("editor-image-url").value.trim();

    if (!headline || !summary || !body) {
      showEditorMessage("Please complete all required fields.", "error");
      return;
    }

    if (!allowedCategories.includes(category)) {
      showEditorMessage("Please choose a valid category.", "error");
      return;
    }

    if (imageUrl) {
      try {
        const url = new URL(imageUrl);

        if (url.protocol !== "https:" && url.protocol !== "http:") {
          showEditorMessage("Use an HTTP or HTTPS image URL.", "error");
          return;
        }
      } catch (error) {
        showEditorMessage("Enter a valid image URL or leave it blank.", "error");
        return;
      }
    }

    const paragraphs = body
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      showEditorMessage("Please enter the full article text.", "error");
      return;
    }

    const newStory = {
      id: `local-story-${Date.now()}`,
      category,
      headline,
      summary,
      imageUrl,
      imageAlt: imageUrl ? headline : "",
      author: "Starkon Editor Prototype",
      publishedAt: new Date().toISOString(),
      sourceName: "Locally created sample",
      sourceUrl: null,
      sourceNote: "Created in the local editor prototype. No external source has been recorded.",
      verificationStatus: "Draft preview — not independently verified",
      status: "Draft Preview",
      isBreaking: false,
      paragraphs
    };

    newsStories.unshift(newStory);
    featuredStoryId = newStory.id;
    activeCategory = "All";
    searchTerm = "";

    const searchInput = getElement("news-search");

    if (searchInput) {
      searchInput.value = "";
    }

    updateCategoryButtons();
    renderFeaturedStory();
    renderNewsStories();
    renderFullArticles();

    form.reset();

    const saved = saveStarkonEditorStories(newsStories);

    if (saved) {
      showEditorMessage(
        "Your story was added and saved in this browser.",
        "success"
      );
    } else {
      showEditorMessage(
        "Your story was added for this session, but browser storage failed. It may disappear after refreshing.",
        "error"
      );
    }

    const latestNews = getElement("latest-news");

    if (latestNews) {
      latestNews.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
}

function showEditorMessage(text, state) {
  const message = getElement("editor-message");

  if (!message) {
    return;
  }

  message.textContent = text;
  message.classList.remove("success", "error");

  if (state) {
    message.classList.add(state);
  }
}

/* Footer */

function updateFooterYear() {
  const footerYear = getElement("footer-year");

  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }
}
