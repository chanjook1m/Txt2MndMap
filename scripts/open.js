function clickElem(elem) {
  // Thx user1601638 on Stack Overflow (6/6/2018 - https://stackoverflow.com/questions/13405129/javascript-create-and-save-file )
  const eventMouse = document.createEvent("MouseEvents");
  eventMouse.initMouseEvent(
    "click",
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  elem.dispatchEvent(eventMouse);
}

function openFile(func) {
  function dispFile(contents) {
    document.getElementById("text-area").value = contents;
  }
  function readFile(e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const contents = e.target.result;
      fileInput.func(contents);
      document.body.removeChild(fileInput);
    };
    reader.readAsText(file);
  }
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.style.display = "none";
  fileInput.onchange = readFile;
  fileInput.func = dispFile;
  document.body.appendChild(fileInput);
  clickElem(fileInput);
}

export { openFile };
