const oldTitle = document.title;

const newTitle = prompt("Enter a new name for this tab:");

if (newTitle && newTitle.trim() !== "" && newTitle !== oldTitle) {
  document.title = newTitle;
}
