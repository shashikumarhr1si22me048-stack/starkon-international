
"use strict";

const allowedBackupCategories = [
  "Karnataka",
  "India",
  "World",
  "Business",
  "Technology",
  "Sports"
];

const MAX_BACKUP_FILE_SIZE = 5 * 1024 * 1024;

document.addEventListener("DOMContentLoaded", initializeBackupPage);

function initializeBackupPage() {
  const exportButton = document.getElementById("export-button");
  const refreshButton = document.getElementById("refresh-count");
  const restoreButton = document.getElementById("restore-button");
  const fileInput = document.getElementById("backup-file");

  if (!exportButton || !refreshButton || !restoreButton || !fileInput) {
    console.error("Backup page controls are missing.");
    return;
  }

  exportButton.addEventListener("click", exportBackup);
  refreshButton.addEventListener("click", refreshStoryCount);
  fileInput.addEventListener("change", handleFileSelection);
  restoreButton.addEventListener("click", restoreBackup);

  refreshStoryCount();
}

function getLocalStories() {
  if (typeof loadStarkonSavedStories !== "function") {
    throw new Error(
      "The Starkon storage functions were not found. Check that data.js loads correctly."
    );
  }

  const stories = loadStarkonSavedStories();

  if (!Array.isArray(stories)) {
    throw new Error("The saved article data could not be read.");
  }

  return stories.filter(isLocalStory);
}

function isLocalStory(story) {
  return Boolean(
    story &&
    typeof story === "object" &&
    typeof story.id === "string" &&
    story.id.startsWith("local-story-")
  );
}

function refreshStoryCount() {
  const count = document.getElementById("story-count");

  try {
    const stories = getLocalStories();
    count.textContent = String(stories.length);
    setStatus(
      "export-status",
      "Your local article count has been refreshed.",
      "success"
    );
  } catch (error) {
    count.textContent = "Unavailable";
    setStatus("export-status", error.message, "error");
  }
}

function exportBackup() {
  try {
    const stories = getLocalStories();

    const backup = {
      app: "Starkon International",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      stories
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], {
      type: "application/json;charset=utf-8"
    });

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = objectUrl;
    link.download = `starkon-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);

    setStatus(
      "export-status",
      `Backup prepared with ${stories.length} locally saved article(s). Keep the downloaded JSON file safe.`,
      "success"
    );
  } catch (error) {
    setStatus(
      "export-status",
      `Backup failed: ${error.message}`,
      "error"
    );
  }
}

function handleFileSelection() {
  const fileInput = document.getElementById("backup-file");
  const restoreButton = document.getElementById("restore-button");
  const file = fileInput.files && fileInput.files[0];

  restoreButton.disabled = true;

  if (!file) {
    setStatus("restore-status", "Choose a backup file first.", "info");
    return;
  }

  if (file.size > MAX_BACKUP_FILE_SIZE) {
    fileInput.value = "";
    setStatus(
      "restore-status",
      "This file is larger than 5 MB. Choose a smaller backup file.",
      "error"
    );
    return;
  }

  if (!file.name.toLowerCase().endsWith(".json")) {
    fileInput.value = "";
    setStatus(
      "restore-status",
      "Choose a JSON backup file ending in .json.",
      "error"
    );
    return;
  }

  restoreButton.disabled = false;

  setStatus(
    "restore-status",
    `Selected: ${file.name}. Click Restore and Merge to validate it.`,
    "info"
  );
}

async function restoreBackup() {
  const fileInput = document.getElementById("backup-file");
  const restoreButton = document.getElementById("restore-button");
  const file = fileInput.files && fileInput.files[0];

  if (!file) {
    setStatus("restore-status", "Choose a backup file first.", "error");
    return;
  }

  if (file.size > MAX_BACKUP_FILE_SIZE) {
    setStatus(
      "restore-status",
      "The selected file exceeds the 5 MB limit.",
      "error"
    );
    return;
  }

  restoreButton.disabled = true;

  try {
    const fileText = await file.text();
    let backup;

    try {
      backup = JSON.parse(fileText);
    } catch (error) {
      throw new Error("The selected file is not valid JSON.");
    }

    validateBackup(backup);

    const existingStories = getLocalStories();
    const mergedById = new Map();

    existingStories.forEach((story) => {
      mergedById.set(story.id, story);
    });

    let addedCount = 0;

    backup.stories.forEach((story) => {
      if (!mergedById.has(story.id)) {
        mergedById.set(story.id, story);
        addedCount += 1;
      }
    });

    const mergedStories = Array.from(mergedById.values());

    if (typeof saveStarkonEditorStories !== "function") {
      throw new Error(
        "The Starkon save function was not found. Check data.js."
      );
    }

    const allStories = [
      ...mergedStories,
      ...(typeof initialNewsStories !== "undefined"
        ? initialNewsStories
        : [])
    ];

    const saved = saveStarkonEditorStories(allStories);

    if (saved !== true) {
      throw new Error(
        "The browser did not confirm that the restored stories were saved."
      );
    }

    refreshStoryCount();

    setStatus(
      "restore-status",
      `Restore complete. Added ${addedCount} new article(s). Existing articles with matching IDs were kept. Total local articles: ${mergedStories.length}.`,
      "success"
    );

    fileInput.value = "";
  } catch (error) {
    setStatus(
      "restore-status",
      `Restore failed: ${error.message}`,
      "error"
    );
  } finally {
    restoreButton.disabled = true;
  }
}

function validateBackup(backup) {
  if (!backup || typeof backup !== "object" || Array.isArray(backup)) {
    throw new Error("The backup must contain a JSON object.");
  }

  if (backup.app !== "Starkon International") {
    throw new Error(
      "This file is not identified as a Starkon International backup."
    );
  }

  if (backup.formatVersion !== 1) {
    throw new Error("This backup format version is not supported.");
  }

  if (!Array.isArray(backup.stories)) {
    throw new Error("The backup does not contain a stories array.");
  }

  if (backup.stories.length > 10000) {
    throw new Error("The backup contains too many stories.");
  }

  const seenIds = new Set();

  backup.stories.forEach((story, index) => {
    validateStory(story, index);

    if (seenIds.has(story.id)) {
      throw new Error(
        `The backup contains a duplicate article ID at entry ${index + 1}.`
      );
    }

    seenIds.add(story.id);
  });
}

function validateStory(story, index) {
  const entry = index + 1;

  if (!story || typeof story !== "object" || Array.isArray(story)) {
    throw new Error(`Article ${entry} is not a valid object.`);
  }

  if (
    typeof story.id !== "string" ||
    !story.id.startsWith("local-story-")
  ) {
    throw new Error(
      `Article ${entry} does not have a valid local article ID.`
    );
  }

  if (
    typeof story.headline !== "string" ||
    !story.headline.trim()
  ) {
    throw new Error(`Article ${entry} is missing its headline.`);
  }

  if (
    typeof story.summary !== "string" ||
    !story.summary.trim()
  ) {
    throw new Error(`Article ${entry} is missing its summary.`);
  }

  if (!allowedBackupCategories.includes(story.category)) {
    throw new Error(`Article ${entry} has an unsupported category.`);
  }

  if (
    !Array.isArray(story.paragraphs) ||
    !story.paragraphs.every(
      (paragraph) => typeof paragraph === "string"
    )
  ) {
    throw new Error(
      `Article ${entry} has an invalid article body.`
    );
  }

  if (
    story.imageUrl !== undefined &&
    story.imageUrl !== null &&
    story.imageUrl !== ""
  ) {
    if (typeof story.imageUrl !== "string") {
      throw new Error(`Article ${entry} has an invalid image URL.`);
    }

    let imageUrl;

    try {
      imageUrl = new URL(story.imageUrl);
    } catch (error) {
      throw new Error(`Article ${entry} has an invalid image URL.`);
    }

    if (
      imageUrl.protocol !== "http:" &&
      imageUrl.protocol !== "https:"
    ) {
      throw new Error(
        `Article ${entry} uses an unsupported image URL protocol.`
      );
    }
  }
}

function setStatus(elementId, message, state) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.remove("success", "error", "info");

  if (state) {
    element.classList.add(state);
  }
}
