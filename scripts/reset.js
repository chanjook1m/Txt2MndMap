import { saveToText } from "./save.js";

function resetTxtBox(txtBox) {
  saveToText();
  txtBox.value = "";
  let event = new Event("keyup");
  txtBox.dispatchEvent(event);
}

export { resetTxtBox };
