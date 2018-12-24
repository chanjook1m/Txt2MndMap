const map = { width: 960, height: 960 };
const defaultStr =
  "aasdfa sfasdfasdfad klfjasdfkjlas fjklasdjfkja sdkfjasdj fkjsdkf\nzzz";

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
