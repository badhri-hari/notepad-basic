document.addEventListener("DOMContentLoaded", function () {
  var header = document.getElementById("header");
  var notesArea = document.getElementById("notes");
  var saveButton = document.getElementById("save-note-button");
  var savedNotesContainer = document.getElementById("saved-notes");
  var notesTitle = document.getElementById("notes-title");
  var foldersSection = document.getElementById("folders-section");
  var addFolderButton = document.getElementById("add-folder-button");
  var folderNameInput = document.getElementById("folder-name-input-field");
  var folderSelectSection = document.getElementById("folder-select-section");
  var folderSelect = document.getElementById("folder-select");
  var saveInFolderButton = document.getElementById("save-in-folder-button");
  var clearFolderSelectionButton = document.getElementById(
    "clear-folder-selection"
  );
  var alertContainer = document.createElement("div");
  alertContainer.id = "alert-container";
  document.body.prepend(alertContainer);

  var savedNotes = JSON.parse(localStorage.getItem("savedNotes")) || [];
  var folders = JSON.parse(localStorage.getItem("folders")) || {};
  var selectedNoteIndex = null;
  var selectedFolder = null;

  var userHasResizedTextarea = false;
  notesArea.addEventListener("mouseup", function () {
    userHasResizedTextarea = true;
  });

  function showAlert(message) {
    alertContainer.textContent = message;
    alertContainer.style.display = "block";
    setTimeout(function () {
      alertContainer.style.display = "none";
    }, 6000);
  }

  function toggleSaveButtonVisibility() {
    if (notesArea.value.trim().length > 0) {
      saveButton.style.opacity = "1";
      saveButton.style.visibility = "visible";
      saveButton.style.display = "flex";
    } else {
      saveButton.style.opacity = "0";
      saveButton.style.visibility = "hidden";
      saveButton.style.display = "none";
    }
  }

  function adjustHeaderSizeForFocus(focused) {
    if (focused) {
      header.classList.add("header-small");
    } else {
      header.classList.remove("header-small");
    }
  }

  notesArea.addEventListener("focus", function () {
    adjustHeaderSizeForFocus(true);
  });

  notesArea.addEventListener("blur", function () {
    adjustHeaderSizeForFocus(false);
    toggleSaveButtonVisibility();
  });

  notesArea.addEventListener("input", toggleSaveButtonVisibility);

  function saveNote() {
    var noteText = notesArea.value.trim();
    if (noteText.length > 3000) {
      showAlert("Note text cannot exceed 3000 characters.");
      return;
    }

    if (!noteText) return;

    var note = {
      title: noteText.split(/\s+/).slice(0, 5).join(" ") + "...",
      content: noteText,
    };

    if (selectedNoteIndex !== null) {
      if (selectedFolder) {
        folders[selectedFolder][selectedNoteIndex] = note;
        localStorage.setItem("folders", JSON.stringify(folders));
      } else {
        savedNotes[selectedNoteIndex] = note;
        localStorage.setItem("savedNotes", JSON.stringify(savedNotes));
      }
      selectedNoteIndex = null;
      selectedFolder = null;
      displaySavedNotes();
      notesArea.value = "";
    } else {
      if (Object.keys(folders).length === 0) {
        savedNotes.push(note);
        localStorage.setItem("savedNotes", JSON.stringify(savedNotes));
        displaySavedNotes();
        notesArea.value = "";
        toggleSaveButtonVisibility();
      } else {
        folderSelectSection.style.display = "block";
        saveButton.style.display = "none";
      }
    }
  }

  function saveNoteInFolder() {
    var noteText = notesArea.value.trim();
    var wordCount = noteText.split(/\s+/).length;
    if (wordCount > 1000) {
      showAlert("Note cannot exceed 1000 words.");
      return;
    }

    if (!noteText) return;

    var note = {
      title: noteText.split(/\s+/).slice(0, 5).join(" ") + "...",
      content: noteText,
    };

    var selectedFolderValue = folderSelect.value;
    if (selectedFolderValue === "none") {
      savedNotes.push(note);
      localStorage.setItem("savedNotes", JSON.stringify(savedNotes));
    } else {
      if (!folders[selectedFolderValue]) folders[selectedFolderValue] = [];
      folders[selectedFolderValue].push(note);
      localStorage.setItem("folders", JSON.stringify(folders));
    }

    notesArea.value = "";
    folderSelectSection.style.display = "none";
    saveButton.style.display = "flex";
    toggleSaveButtonVisibility();
    displaySavedNotes();
    displayFolders();
  }

  function displaySavedNotes(notes = savedNotes, folderName = null) {
    savedNotesContainer.innerHTML = "";
    notesTitle.innerHTML = folderName ? `Notes in ${folderName}` : "All Notes";

    if (notes.length === 0) {
      savedNotesContainer.innerHTML =
        '<div class="nothing-is-there">No notes created.</div>';
    } else {
      notes.forEach(function (note, index) {
        var noteElement = document.createElement("div");
        noteElement.classList.add("saved-note");

        var titleElement = document.createElement("h4");
        titleElement.textContent = note.title;
        noteElement.appendChild(titleElement);

        var deleteIcon = document.createElement("span");
        deleteIcon.classList.add("delete-icon");
        deleteIcon.textContent = "X";
        noteElement.appendChild(deleteIcon);

        savedNotesContainer.appendChild(noteElement);

        noteElement.onclick = function () {
          document
            .querySelectorAll(".saved-note.selected")
            .forEach(function (selectedNote) {
              selectedNote.classList.remove("selected");
            });
          noteElement.classList.add("selected");
          notesArea.value = note.content;
          toggleSaveButtonVisibility();
          selectedNoteIndex = index;
          selectedFolder = folderName;
        };

        deleteIcon.onclick = function (event) {
          event.stopPropagation();
          notes.splice(index, 1);
          if (folderName) {
            folders[folderName] = notes;
            localStorage.setItem("folders", JSON.stringify(folders));
          } else {
            savedNotes = notes;
            localStorage.setItem("savedNotes", JSON.stringify(savedNotes));
          }
          displaySavedNotes(notes, folderName);
        };
      });
    }
  }

  function displayFolders() {
    foldersSection.innerHTML = "";
    var folderNames = Object.keys(folders);

    if (folderNames.length === 0) {
      foldersSection.innerHTML =
        '<div class="nothing-is-there">No folders created.</div>';
    } else {
      folderSelect.innerHTML =
        '<option value="none">Don\'t Save in Any Folder</option>';
      folderNames.forEach(function (folderName) {
        var folderElement = document.createElement("div");
        folderElement.classList.add("folder-name");

        var titleElement = document.createElement("h4");
        titleElement.textContent = folderName;
        folderElement.appendChild(titleElement);

        var folderIcon = document.createElement("div");
        folderIcon.classList.add("folder-icon");
        var img = document.createElement("img");
        img.src = "images/folder-icon.png";
        folderIcon.appendChild(img);
        folderIcon.classList.add("folder-icon");
        folderElement.appendChild(folderIcon);

        var deleteIcon = document.createElement("div");
        deleteIcon.classList.add("delete-icon");
        deleteIcon.textContent = "X";
        folderElement.appendChild(deleteIcon);

        foldersSection.appendChild(folderElement);

        var folderOption = document.createElement("option");
        folderOption.value = folderName;
        folderOption.textContent = folderName;
        folderSelect.appendChild(folderOption);

        folderElement.onclick = function () {
          document
            .querySelectorAll(".folder-name.selected")
            .forEach(function (selectedFolder) {
              selectedFolder.classList.remove("selected");
            });
          folderElement.classList.add("selected");
          selectedFolder = folderName;
          clearFolderSelectionButton.style.display = "block";
          addFolderButton.style.display = "none";
          displaySavedNotes(folders[folderName], folderName);
        };

        deleteIcon.onclick = function (event) {
          event.stopPropagation();
          delete folders[folderName];
          localStorage.setItem("folders", JSON.stringify(folders));
          displayFolders();
        };
      });
    }
  }

  function addFolder() {
    var folderName = folderNameInput.value.trim();
    if (folderName.length > 18) {
      showAlert("Folder name cannot exceed 18 characters.");
      return;
    }
    if (folderName) {
      folders[folderName] = [];
      localStorage.setItem("folders", JSON.stringify(folders));
      folderNameInput.value = "";
      displayFolders();
    }
  }

  function clearFolderSelection() {
    selectedFolder = null;
    clearFolderSelectionButton.style.display = "none";
    addFolderButton.style.display = "flex";
    displaySavedNotes();
  }

  saveButton.addEventListener("click", saveNote);
  saveInFolderButton.addEventListener("click", saveNoteInFolder);
  clearFolderSelectionButton.addEventListener("click", clearFolderSelection);
  addFolderButton.addEventListener("click", function () {
    addFolderButton.style.display = "none";
    folderNameInput.style.display = "block";
    folderNameInput.focus();
  });

  folderNameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addFolder();
      folderNameInput.style.display = "none";
      addFolderButton.style.display = "flex";
    }
  });

  toggleSaveButtonVisibility();
  notesArea.addEventListener("input", toggleSaveButtonVisibility);

  displaySavedNotes();
  displayFolders();

  var changeColorButton = document.getElementById(
    "change-primary-color-button"
  );
  var setDefaultColorButton = document.getElementById(
    "set-default-color-button"
  );

  function isValidHex(color) {
    return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
  }

  function changePrimaryColor(newColor) {
    document.documentElement.style.setProperty("--primary-color", newColor);
    localStorage.setItem("primaryColor", newColor);

    document.querySelectorAll("svg path").forEach(function (svgPath) {
      svgPath.setAttribute("stroke", newColor);
    });
  }

  changeColorButton.addEventListener("click", function () {
    var newColor = prompt(
      "Enter a new primary color (in hex code, e.g., #ff0000):"
    );
    if (newColor) {
      if (isValidHex(newColor)) {
        changePrimaryColor(newColor);
      } else {
        showAlert(
          "Invalid hex color. Enter a valid hex code (ex. #ff0000 or #fff)."
        );
      }
    }
  });

  setDefaultColorButton.addEventListener("click", function () {
    var defaultColor = "#fff49c";
    changePrimaryColor(defaultColor);
  });

  var savedColor = localStorage.getItem("primaryColor");
  if (savedColor) {
    changePrimaryColor(savedColor);
  } else {
    changePrimaryColor("#fff49c");
  }
});
