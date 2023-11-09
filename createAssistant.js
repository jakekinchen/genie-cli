const axios = require('axios');
const ignore = require('ignore');
const fs = require('fs-extra');
const path = require('path');
const {
  listFiles,
  uploadFile,
  deleteFile,
  createAssistant,
  retrieveAssistant,
  deleteAssistant,
  createAssistantFile,
  listAssistantFiles,
  listAssistantDetails,
} = require('./openaiMethods');
const {
  assistantDescription,
  assistantInstructions,
} = require('./config');

// Load .gitignore rules
const ig = ignore().add(fs.readFileSync('.gitignore').toString());

// Allowed extensions for upload
const allowedExtensions = new Set(['.js', '.css', '.jsx', '.tsx', '.ts', '.html', '.json']);

async function commentFilePaths(dirPath = '/../') {
    // Helper function to insert a comment at the top of a file
    const prependComment = (filePath, comment) => {
        const data = fs.readFileSync(filePath, 'utf8');
        const commentedData = `// ${comment}\n${data}`;
        fs.writeFileSync(filePath, commentedData, 'utf8');
    };

    // Recursive function to process each file/directory
    const processDirectory = async (currentPath) => {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);

            // If entry is a directory, recurse into it
            if (entry.isDirectory()) {
                await processDirectory(fullPath);
            } else {
                const relativePath = path.relative(dirPath, fullPath);
                // Check if the file is ignored or not an allowed extension
                if (ig.ignores(relativePath) || !allowedExtensions.has(path.extname(entry.name))) {
                    continue;
                }
                // Prepend the relative path comment to the file
                prependComment(fullPath, `Path: ${relativePath}`);
            }
        }
    };

    // Start processing from the root directory
    await processDirectory(dirPath);
}

// Main function to create an assistant and upload a file
async function createAndUploadAssistant() {
  try {
      // Create the assistant
      const assistant = await createAssistant(
          'gpt-4-1106-preview', // model
          'GenieGPT', // name
          assistantDescription, // description
          assistantInstructions, // instructions
          [{ "type": "retrieval" }], // tools
          [], // file_ids will be updated after file upload
          {} // metadata
      );

      const assistantId = assistant.id;
        // if code.json exists in ./Genie, and it is not empty, upload it
        if (fs.existsSync('./Genie/code.json') && fs.statSync('./Genie/code.json').size > 0) {
            const response = uploadFileIntoAssistant('./Genie/code.json', assistantId);
            console.log(response);
        }
        console.log(response);
        return assistantId;

  } catch (error) {
      console.error('Error in creating or uploading assistant:', error);
      // If there is an error, delete the assistant
      await deleteAssistant(assistantId);
  }
}

// Helper function to read files and directories recursively
async function readFiles(dir, uploadList = [], allFilesList = []) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (ig.ignores(filePath)) {
      continue; // Skip ignored files
    }
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      allFilesList.push({ path: filePath, type: 'directory' });  // Add directory to all files list
      await readFiles(filePath, uploadList, allFilesList); // Recursively read files
    } else {
      allFilesList.push({ path: filePath, type: 'file' });  // Add file to all files list
      if (allowedExtensions.has(path.extname(file))) {
        uploadList.push(filePath); // Only add file with allowed extensions for upload
      }
    }
  }
  return { uploadList, allFilesList };
}

async function uploadFileIntoAssistant(filePath, assistantId) {
  // First upload the file
  const fileResponse = await uploadFile(filePath);
  const fileId = fileResponse.id;
  console.log('File uploaded with ID:', fileId);
  // Attach the file to the assistant
  const assistantFile = await createAssistantFile(assistantId, fileId);
  console.log('Assistant file created with ID:', assistantFile.id);
  return fileId;
}

async function delete_all_files() {
  try {
    const files = await listFiles();
    console.log('Files listed:', files);
    for (const file of files) {
      await deleteFile(file.id);
    }
  } catch (error) {
    console.error('Error in deleting files:', error);
  }
}

// Start the process
async function main() {
  try {
    //console.log(await listFiles());
   //await delete_all_files();

    
  } catch (error) {
    console.error('Error:', error);
    
  }
}

module.exports = {
  createAndUploadAssistant,
  uploadFileIntoAssistant,
}