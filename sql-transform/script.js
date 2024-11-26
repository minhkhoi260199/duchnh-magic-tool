console.log("SQL Transform breakpoint!!! ");
const arguments = new Set();

const camelize = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
};

const transformInDifferPattern = (text) => {
  return text.replace(/IN \args\.(\w+)/g, (match, p1) => {
    if (/List|Set/.test(p1)) {
      return `IN \n<foreach collection="${p1}" item="item" separator="," open="(" close=")">\n  #{item}\n</foreach>`;
    }
    return match;
  });
};

const transformInPattern = (text) => {
  return text.replace(/IN\s+\(\s*(args\.\w+)\s*\)/g, (match, p1) => {
    if (/List$|Set$/.test(p1)) {
      return `IN \n<foreach collection="${p1}" item="item" separator="," open="(" close=")">\n  #{item}\n</foreach>`;
    }
    return match;
  });
};

const transformIfConditionsForList = (text) => {
  return text.replace(
    /<if test='Request Parameter\.(.*?) != null and Request Parameter\.\1\.size\(\) > 0'>/g,
    (match, p1) => {
      return `<if test='args.${camelize(p1)} != null and args.${camelize(
        p1
      )}.size() > 0'>`;
    }
  );
};

const transformIfConditionsForText = (text) => {
  return text.replace(
    /<if test='Request Parameter\.(.*?) != null and Request Parameter\.\1\ != ""'>/g,
    (match, p1) => {
      return `<if test='args.${camelize(p1)} != null and args.${camelize(
        p1
      )} != ""'>`;
    }
  );
};

const transformIfDifferConditionsForText = (text) => {
  return text.replace(
    /<if test='Request Parameter\.(.*?) != null and Request Parameter\.\1\ <> ""'>/g,
    (match, p1) => {
      return `<if test='args.${camelize(p1)} != null and args.${camelize(
        p1
      )} <> ""'>`;
    }
  );
};

function convertFullWidthToHalfWidth(input) {
  return input
    .replace(/[\uFF01-\uFF5E]/g, function (character) {
      return String.fromCharCode(character.charCodeAt(0) - 0xfee0);
    })
    .replace(/　/g, " ");
}

function printPrivateStrings(arr) {
  const result = [];
  Array.from(arr).forEach((item) => {
    if (item.includes("List")) {
      result.push(`private List<String> ${item};`);
    } else if (item.includes("Set")) {
      result.push(`private Set<String> ${item};`);
    } else result.push(`private String ${item};`);
  });
  return result;
}

const transformCommaWithSpace = (text) => {
  return text.replace(/, /g, ",");
};

const processText = () => {
  const inputText = document.getElementById("inputText").value;
  let updatedText = inputText;

  const regex = /#\{([^}]+)\}/g;
  let match;

  const regexWrongFormat = /\$\{([^}]+)\}/g;
  if ((match = regexWrongFormat.exec(inputText)) !== null) {
    alert(`Wrong Mybatis format detected. ${match[0]}`);
    throw new Error(`Wrong Mybatis format with format ${match[0]}`);
  }

  while ((match = regex.exec(inputText)) !== null) {
    const originalText = match[0];
    const content = match[1];

    const transformedContent = content
      .replace(/Request Parameter/g, "")
      .replace(/Execution Context/g, "")
      .replace(/args\./g, "")
      .replace(/Argument\./g, "")
      .replace(/（/g, "(")
      .replace(/）/g, ")")
      .replace(/\s*IN\s*[\(\uFF08]/g, "IN (")
      .replace(/\s*IN\s*[\uFF09\)]/g, "IN )")
      .replace(/\./g, " ")
      .trim();
    console.log(transformedContent);

    const camelizeData = camelize(transformedContent);
    const camelCasedContent =
      originalText.includes("List") || originalText.includes("Set")
        ? `args.${camelizeData}`
        : `#{args.${camelizeData}}`;

    const camelCasedContext = /Context\b/.test(originalText)
      ? `#{context.${camelizeData}}`
      : camelCasedContent;

    arguments.add(camelizeData);

    updatedText = updatedText.replace(originalText, camelCasedContext);
  }

  updatedText = convertFullWidthToHalfWidth(updatedText);
  updatedText = transformInPattern(updatedText);
  updatedText = transformIfConditionsForList(updatedText);
  updatedText = transformIfConditionsForText(updatedText);
  updatedText = transformCommaWithSpace(updatedText);
  updatedText = transformInDifferPattern(updatedText);
  updatedText = transformIfDifferConditionsForText(updatedText);

  document.getElementById("outputText").value = updatedText;

  console.log("Arguments:", Array.from(arguments), arguments.size);
  console.log("Argument in Java", printPrivateStrings(arguments));
};

document.getElementById("processBtn").addEventListener("click", processText);
