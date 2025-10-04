import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * Find the most relevant checklist JSON file based on the question
 */
export async function findRelevantChecklist(question: string, checklistDir: string): Promise<any | null> {
  try {
    const categories = await fs.readdir(checklistDir);
    const allChecklists: Array<{filePath: string, data: any, similarity: number}> = [];
    
    // Read all JSON files from all categories
    for (const category of categories) {
      const categoryPath = path.join(checklistDir, category);
      const stat = await fs.stat(categoryPath);
      
      if (!stat.isDirectory()) continue;
      
      const files = await fs.readdir(categoryPath);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(categoryPath, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          if (data.question && data.checklist) {
            const similarity = calculateSimilarity(question.toLowerCase(), data.question.toLowerCase());
            allChecklists.push({ filePath, data, similarity });
          }
        } catch (error) {
          // Skip invalid JSON files
          console.warn(`Skipping invalid JSON file: ${filePath}`);
        }
      }
    }
    
    if (allChecklists.length === 0) {
      return null;
    }
    
    // Sort by similarity and return the most relevant
    allChecklists.sort((a, b) => b.similarity - a.similarity);
    
    const best = allChecklists[0];
    if (best && best.similarity > 0.85) {
      console.log(`Found checklist: ${best.filePath} (similarity: ${best.similarity.toFixed(2)})`);
      return best.data.checklist;
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding checklist: ${error}`);
    return null;
  }
}

/**
 * Calculate similarity between two strings using simple word overlap
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/).filter(w => w.length > 2);
  const words2 = str2.split(/\s+/).filter(w => w.length > 2);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  let overlap = 0;
  for (const word of set1) {
    if (set2.has(word)) {
      overlap++;
    }
  }
  
  const maxSize = Math.max(set1.size, set2.size);
  return maxSize > 0 ? overlap / maxSize : 0;
}

