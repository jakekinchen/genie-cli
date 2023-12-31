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
  // Find the root directory of codebase by looking for package.json or .git
  let codeBaseRoot = path.join(__dirname, '..');
  
  // Define a function to check if the directory is the root of the codebase
  const isCodebaseRoot = (dir) => {
    // Check if either package.json or .git directory exists in this directory
    return fs.existsSync(path.join(dir, 'package.json')) || fs.existsSync(path.join(dir, '.git'));
  };
  
  // Traverse up until we find the root
  while (codeBaseRoot !== '/' && !isCodebaseRoot(codeBaseRoot)) {
    codeBaseRoot = path.dirname(codeBaseRoot);
  }

  // At this point, codeBaseRoot is either the root directory or the file system root ('/')
  // You might want to handle the case when the file system root is reached and no codebase root was found
  if (codeBaseRoot === '/' && !isCodebaseRoot(codeBaseRoot)) {
    throw new Error('Unable to find the root directory of the codebase.');
  }
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
