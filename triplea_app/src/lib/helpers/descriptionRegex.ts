const descriptionRegex = (description: string, colorChange: boolean) => {
    const replacedDescription = description?.replace(/\n\n/g, "\n \n");
    const lines = replacedDescription?.split(/[\r\n]+/);
  
    const styledLines = lines?.map((line: string) => {
      const words = line.split(/(?=[@#])|\s+/);
      const styledWords = words.map((word) => {
        if (word[0] === "#") {
          return colorChange
            ? `<em id="hashtags" style="color: #f9ed00; font-style: normal; word-break: break-all; margin-right: 4px;">${word}</em>`
            : `<em id="hashtags" style="color: #FD91C6; font-style: normal; word-break: break-all; margin-right: 4px;">${word}</em>`;
        } else if (word[0] === "@") {
          const link = `https://cypher.digitalax.xyz/autograph/${
            word?.includes(".lens")
              ? word?.replace(".lens", "").replace("@", "")
              : word?.replace("@", "")
          }`;
          return colorChange
            ? ` <a href="${link}" rel="noreferrer" target="_blank" style="word-break: break-all; margin-right: 4px;"> <span style="color: #f9ed00;">${word}</span> </a> `
            : ` <a href="${link}" target="_blank" rel="noreferrer" style="word-break: break-all; margin-right: 4px;"> <span style="color: #FD91C6;">${word}</span> </a> `;
        } else if (
          word.startsWith("http") ||
          word.startsWith("www.") ||
          word.endsWith(".xyz") ||
          word.endsWith(".com")
        ) {
          const url = word?.includes("//") ? word : `//${word}`;
          return colorChange
            ? ` <a href="${url}" style="word-break: break-all; margin-right: 4px;" target="_blank" rel="noreferrer"> <span style="color: #f9ed00;">${word}</span> </a> `
            : ` <a href="${url}" style="word-break: break-all; margin-right: 4px;" target="_blank" rel="noreferrer"> <span style="color: #FD91C6;">${word}</span> </a> `;
        } else {
          return word;
        }
      });
      return `<span>${styledWords.join(" ")}</span>`;
    });
  
    const formattedDescription = styledLines.join("<br />");
    return `<div style="word-wrap: break-word; max-width: 100%;">${formattedDescription}</div>`;
  };
  
  export default descriptionRegex;
  