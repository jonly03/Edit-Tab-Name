// A list of colors available in the Tab Groups API
const COLORS = [
  "grey",
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
];

// Function to create the context menu
function createContextMenu() {
  // Clear any existing menus to avoid duplicates
  chrome.contextMenus.removeAll(() => {
    // Create the parent "Edit tab name" item
    chrome.contextMenus.create({
      id: "edit-tab-name",
      title: "Edit tab name",
      contexts: ["page"],
    });

    // Create the parent "Highlight Tab" item
    chrome.contextMenus.create({
      id: "highlight-tab-parent",
      title: "Highlight Tab",
      contexts: ["page"],
    });

    // Create a submenu item for each color
    COLORS.forEach((color) => {
      chrome.contextMenus.create({
        id: `highlight-color-${color}`,
        parentId: "highlight-tab-parent",
        title: color.charAt(0).toUpperCase() + color.slice(1), // Capitalize first letter
        contexts: ["page"],
      });
    });

    // Add a separator
    chrome.contextMenus.create({
      id: "separator",
      type: "separator",
      parentId: "highlight-tab-parent",
      contexts: ["page"],
    });

    // Add the "Remove Highlight" option
    chrome.contextMenus.create({
      id: "remove-highlight",
      parentId: "highlight-tab-parent",
      title: "Remove Highlight",
      contexts: ["page"],
    });
  });
}

// Create the menu when the extension is installed or updated
chrome.runtime.onInstalled.addListener(createContextMenu);

// Also re-create it when the browser starts, just in case
chrome.runtime.onStartup.addListener(createContextMenu);

// Listener for all context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // Handle "Edit tab name" click
  if (info.menuItemId === "edit-tab-name") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    return; // Stop execution
  }

  // Handle "Remove Highlight" click
  if (info.menuItemId === "remove-highlight") {
    chrome.tabs.ungroup(tab.id);
    return; // Stop execution
  }

  // Handle color clicks
  if (info.parentMenuItemId === "highlight-tab-parent") {
    const color = info.menuItemId.replace("highlight-color-", ""); // e.g., "blue"

    try {
      // Create a new group with the selected tab
      const groupId = await chrome.tabs.group({
        tabIds: tab.id,
      });

      // Update the new group with the chosen color and title
      await chrome.tabGroups.update(groupId, {
        color: color,
        title: " ", // Use a space or the tab's title as the group name
      });
    } catch (error) {
      // If the tab is already in a group, this will fail.
      // So, we find its group and update that instead.
      if (tab.groupId) {
        await chrome.tabGroups.update(tab.groupId, { color: color });
      }
      console.log(error); // Log error for debugging
    }
  }
});
