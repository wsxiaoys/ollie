import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

interface BenchItem {
  index: number;
  question: string;
  checklist: Array<{
    id: number;
    title: string;
    description: string;
    maxScore: number;
  }>;
  class: string;
  difficulty: string;
}

async function convertBenchToLibrary() {
  const inputFile = './data/artifacts_bench.jsonl';
  const outputDir = 'library';

  // Read the JSONL file
  const content = readFileSync(inputFile, 'utf-8');
  const lines = content.trim().split('\n');

  console.log(`Processing ${lines.length} items...`);

  for (const line of lines) {
    const item: BenchItem = JSON.parse(line);
    
    // Use the "class" field as category (subdirectory name)
    const index = item.index;
    const category = item.class;
    const categoryDir = join(outputDir, sanitizeCategoryName(category));
    
    // Create category directory if it doesn't exist
    mkdirSync(categoryDir, { recursive: true });
    
    // Write the JSON file with index as filename
    const outputFile = join(categoryDir, `${index}.json`);
    writeFileSync(outputFile, JSON.stringify(item, null, 2), 'utf-8');
    
    console.log(`Created: ${outputFile}`);
  }

  console.log('\nConversion completed!');
}

convertBenchToLibrary().catch(console.error);


function sanitizeCategoryName(name: string): string {
  return name.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
}