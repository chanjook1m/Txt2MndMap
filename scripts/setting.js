const map = { width: 960, height: 960 };
const defaultStr =
  "You cannot change the circumstances but you can change yourself. That is something you have charge of\n" +
  "  Give thanks for a little and you will find a lot\n" +
  "    Do what you can, with what you have, where you are\n" +
  "      Don't think about what might go wrong, think about what could be right\n" +
  "        The meaning of life is to find your gift. The purpose of life is to give it away";

function getSetting(key) {
  let setting;
  try {
    setting = JSON.parse(localStorage.getItem(key));
    txtBox.value = setting;
  } catch (exception) {
    // Ignored
  }
  if (!setting || setting == "") {
    setting = defaultStr;
  }
  return setting;
}

function setSetting(key, value) {
  if (!value) value = defaultStr;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (exception) {
    console.error(exeption);
  }
}

export { map, getSetting, setSetting };
