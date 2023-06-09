import { Injectable } from "@angular/core";

const PARA_LENGTH = 1000;

@Injectable({
    providedIn: 'root',
})
export class TextSplitUtility {
    constructor() { /** */ }
    
    splitIntoParagraphs(bulkText: string): string[] {
      try {
        // const fileContents = fs.readFileSync(filePath, 'utf8');
        const lines = bulkText.split('\n').filter(Boolean);
        const paragraphs = lines.flatMap(this.buildParagraph);
        return paragraphs;
      } catch (err) {
        console.error(`Error splitting into paragraphs: ${err}`);
        return [];
      }
    }
    
    private buildParagraph(line: string): string[] {
      const split = line.match(/(.+?[\.\?!][^\w\s]*)(?=\s|$)/g);
    
      let ret: string[] = [];
      let para = '';
    
      while (split && split.length > 0) {
        const words = split.shift();
        const punct = words?.match(/[\.\?!][^\w\s]*/)?.[0];
        const text = words && punct ? words + punct : '';
    
        // if (text && punct && punct.startsWith('?')) {
        //   // sentence is a question, force into own paragraph
        //   if (para) {
        //     // close prev paragraph
        //     ret.push(para);
        //     para = '';
        //   }
        //   ret.push(text); // new paragraph is just the question
        //   continue;
        // }
        if (para) {
          const commaPos = text.indexOf(',');
          //hit the pretermined length
          if (para.length + text.length > PARA_LENGTH) { 
            ret.push(para);
            para = '';
          }
        }
    
        para += (para ? ' ' : '') + text;
      }
       ret.push(para);
    
      return ret;
    }
}
