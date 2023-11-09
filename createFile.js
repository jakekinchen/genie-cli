const fs = require('fs');
const path = require('path');
const ignore = require('ignore');

const code_extensions = require('./config').code_extensions;
const allowedExtensions = new Set(code_extensions);

// Load .gitignore rules
const ig = ignore().add(fs.readFileSync('.gitignore', 'utf8'));

// Check if the file should be ignored based on .gitignore and other criteria
const shouldIgnoreFile = (file) => {
  const relativePath = path.relative(process.cwd(), file);
  // Ignore files inside .git directory or the Genie directory
  if (relativePath.startsWith('.git') || relativePath.startsWith('Genie')) {
    return true;
  }
  // Use ignore to check against .gitignore rules
  return ig.ignores(relativePath);
};

// Read the contents of a file if it has an allowed extension
const readFileContents = (filePath) => {
  if (allowedExtensions.has(path.extname(filePath))) {
    return fs.readFileSync(filePath, 'utf8').replace(/\r?\n|\r/g, '');
  }
  return null; // Content is not included for disallowed file types
};

// Walk through the directory tree recursively
const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const dirFile = path.join(dir, file);
    if (!shouldIgnoreFile(dirFile)) {
      if (fs.statSync(dirFile).isDirectory()) {
        filelist = walkSync(dirFile, filelist); // Recurse into a subdirectory
      } else {
        filelist.push(dirFile); // It's a file. Add to the list
      }
    }
  });
  return filelist;
};

// Write JSONL to a file
const writeJSON = (data, filePath) => {
  // Convert the entire data array into a JSON string
  const jsonString = JSON.stringify(data); // The '2' argument here adds indentation for readability
  fs.writeFileSync(filePath, jsonString);
};

// Main function to create .jsonl file
const createJSONDocument = () => {
  // Find the root directory of codebase
  // The root directory of codebase is one level up from Genie
  let codeBaseRoot = path.join(__dirname, '..');
  while (codeBaseRoot !== '/' && !fs.existsSync(path.join(codeBaseRoot, 'codeBase'))) {
    codeBaseRoot = path.dirname(codeBaseRoot);
  }
  codeBaseRoot = path.join(codeBaseRoot, 'codeBase');

  // Get all files in the project, excluding .gitignored files
  const allFiles = walkSync(codeBaseRoot);

  // Create a JSON entry for each file
  const jsonData = allFiles.map((filePath) => {
    const relativePath = path.relative(codeBaseRoot, filePath);
    return {
      file_path: relativePath,
      content: readFileContents(filePath),
    };
  });

  // Write the JSON document to the Genie directory within codebase
  const genieRoot = path.join(codeBaseRoot, 'Genie');
  writeJSON(jsonData, path.join(genieRoot, 'code.json'));
};


module.exports = {
  createJSONDocument,
};