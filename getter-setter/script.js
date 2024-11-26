console.log("Getter Setter breakpoint!!!");

function toCamelCase(str) {
  return str
    .replace(/\s(.)/g, (match, letter) => letter.toUpperCase())
    .replace(/^./, (match) => match.toLowerCase())
    .replace(/ID$/, "Id");
}

// Sub-function to transform whatever is between ${ and the first dot "." to "Loop Variables"
function transformLoopVariables(loopExpression) {
  const regex = /\${([^\.]+)\./; // Matches everything between ${ and the first dot
  return loopExpression.replace(regex, "${Loop Variables."); // Replace with "Loop Variables"
}

function processInputText(inputText) {
  const lines = inputText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  let result = "";

  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      // Ensure there are at least 3 lines to process
      const label = lines[i]; // First line, which can be ignored or handled differently
      let loopExpression = lines[i + 1]; // The second line contains the loop expression
      const dataType = lines[i + 2]; // The data type is expected in the third line

      // Apply the transformation to the loop expression first
      loopExpression = transformLoopVariables(loopExpression);

      console.log(`Transformed loop expression: ${loopExpression}`); // Debugging log

      const matchVar = loopExpression.match(/\${([^}]+)}/); // Match ${...} format for variable
      const matchLoop = loopExpression.match(
        /\${(Loop\s*\w+)\s*(Variables|Record)?\.(.*?)}/
      );
      const matchLoopShort = loopExpression.match(/\${(Loop\s*\w+)\.(.*?)}/);

      // Debugging: Check if regex matches
      console.log(`matchVar: ${matchVar}`);
      console.log(`matchLoop: ${matchLoop}`);
      console.log(`matchLoopShort: ${matchLoopShort}`);

      if (matchVar && (matchLoop || matchLoopShort)) {
        const variableName = toCamelCase(matchVar[1].trim()); // Convert variable to camel case

        let loopType, loopVarName;
        if (matchLoop) {
          loopType = matchLoop[1].replace(/\s+/g, ""); // Clean up any spaces in loop type (e.g., "LoopC" or "Loop C")
          loopVarName = toCamelCase(matchLoop[3]);
        } else if (matchLoopShort) {
          loopType = matchLoopShort[1].replace(/\s+/g, ""); // Clean up any spaces in loop type
          loopVarName = toCamelCase(matchLoopShort[2]);
        }

        // Generate the desired result
        const loopVariables = `${loopType.toLowerCase()}Variables`; // Correct variable name
        const loopVariablesVariable = `${loopType.toLowerCase()}VariablesVariable`; // Correct variable name

        // Output the result with correct formatting
        result += `${loopVariables}.set${toCamelCase(
          variableName
        )}(${loopVariablesVariable}.get${toCamelCase(loopVarName)}());\n`;
      } else {
        // If the match is invalid, return a more informative message
        result += `Invalid format in lines ${i + 1}-${
          i + 2
        }. Ensure correct syntax for variable and loop.\n`;
      }
    } else {
      result += `Missing lines for block starting at line ${
        i + 1
      }. Ensure input contains sets of 3 lines.\n`;
    }
  }

  return result.trim();
}

document.getElementById("processBtn").addEventListener("click", () => {
  const inputText = document.getElementById("inputText").value;

  if (!inputText.trim()) {
    alert("Please enter some input text.");
    return;
  }

  let outputText = processInputText(inputText);
  outputText = outputText
    .replace("loopVariables.", "")
    .replace("loopvariablesVariables", "loopVariables");

  document.getElementById("outputText").value = outputText;
});
