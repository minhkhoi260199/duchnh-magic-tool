console.log("Text-Replacer breakpoint!!!");
const cleanReplacementValue = (value) => {
  if (/(String|Date|DateTime|Timestamp)/.test(value)) {
    return `'${value.replace(/\(.*?\)/g, "").trim()}'`;
  } else {
    return value
      .replace(/\(.*?\)/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
};

const processSQL = () => {
  const sqlInput = document.getElementById("sqlInput").value;
  const valueInput = document.getElementById("valueInput").value;

  const replacements = valueInput.split(",").map((s) => s.trim());
  const cleanedReplacements = replacements.map(cleanReplacementValue);

  const questionMarkCount = (sqlInput.match(/\?/g) || []).length;
  if (questionMarkCount !== cleanedReplacements.length) {
    alert(
      `Number of parameters is not equal. The "?" count is ${questionMarkCount}, but the values count is ${cleanedReplacements.length}.`
    );
    return;
  }

  let updatedText = sqlInput;
  let replacementIndex = 0;
  updatedText = updatedText.replace(/\?/g, () => {
    if (replacementIndex < cleanedReplacements.length) {
      return cleanedReplacements[replacementIndex++];
    } else {
      return "?";
    }
  });

  document.getElementById("output").value = updatedText;
};

document.getElementById("executeBtn").addEventListener("click", processSQL);
