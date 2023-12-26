const { readFile } = require('fs').promises;
const path = require('path');

async function getBadWords(badWordsJSON) {
  try {
    const fileContent = await readFile(badWordsJSON, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error while reading bad words from JSON:', error);
  }
}

function hasProfanity(message, badWords) {
  const messageText = message?.content?.toLowerCase(); // Ensure nullish-coalescing and case-insensitivity
  return badWords.some((badWord) => messageText?.includes(badWord));
}

module.exports = { getBadWords, hasProfanity };