export interface DictionaryResult {
  word: string;
  ipa: string;
  pos: string;
  definitions: { zh: string }[];
}

export const DICT_SYSTEM_PROMPT = `You are an English-Chinese dictionary. For the given English word, output a JSON object with this exact structure:

{
  "word": "string",
  "ipa": "string (IPA pronunciation)",
  "pos": "string (part of speech, e.g. n./v./adj./adv./prep.)",
  "definitions": [
    { "zh": "Chinese definition" }
  ]
}

Rules:
- Output 2-3 most common definitions, ordered by frequency
- IPA must use standard International Phonetic Alphabet
- Output ONLY the JSON object, no markdown fences, no extra text`;

export function dictUserPrompt(word: string): string {
  return `Define: ${word}`;
}

export function parseDictionaryResponse(raw: string): DictionaryResult | null {
  try {
    const cleaned = raw
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.word && parsed.pos && Array.isArray(parsed.definitions)) {
      return parsed as DictionaryResult;
    }
    return null;
  } catch {
    return null;
  }
}
