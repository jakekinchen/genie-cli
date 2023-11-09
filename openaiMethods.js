
const OpenAI = require('openai'); // Import the OpenAI API wrapper
const dotenv = require('dotenv'); // Import dotenv to load environment variables
const path = require('path'); // Import path to work with file paths

dotenv.config({path: 'Genie/.env'}); // Load the environment variables from a .env file

const openai = new OpenAI(process.env.OPENAI_API_KEY); // Initialize the OpenAI client with your API key
const fsp = require('fs').promises; // Make sure to use the promises version for async/await
const fs = require('fs'); // Import fs to work with the file system

// Function to list files
async function listFiles(purpose) {
  try {
    const response = await openai.files.list({ purpose });
    //console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error listing files:", error);
  }
}

// Function to upload a single file to OpenAI and return the file ID
async function uploadFile(filePath, purpose='assistants') {
  const content = fs.createReadStream(filePath);
  // Use the OpenAI API to upload the file
  response = await openai.files.create({
    file: content,
    purpose: "assistants",
  });
  // Example response format
  return response; // Replace with actual response from OpenAI
}

// Function to delete a file
async function deleteFile(fileId) {
  try {
    const response = await openai.files.del(fileId);
    //console.log("File deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

// Function to retrieve file information
async function retrieveFileInfo(fileId) {
  try {
    const response = await openai.files.retrieve(fileId);
    return response.data;
  } catch (error) {
    console.error("Error retrieving file info:", error);
  }
}

// Function to retrieve file content
async function retrieveFileContent(fileId) {
  try {
    const response = await openai.files.retrieveContent(fileId);
    return response.data;
  } catch (error) {
    console.error("Error retrieving file content:", error);
  }
}

// Function to create an assistant
async function createAssistant(model, name, description, instructions, tools, file_ids, metadata) {
    try {
        // Replace the below line with the actual OpenAI API call to create the assistant
        const response = await openai.beta.assistants.create({
            model,
            name,
            description,
            instructions,
            tools,
            file_ids,
            metadata,
        });
        console.log("Assistant created:", response);
        return response; // Return the assistant data
    } catch (error) {
        console.error("Error creating assistant:", error);
        throw error; // Rethrow the error to be caught in the calling function
    }
}


// Function to retrieve an assistant
async function retrieveAssistant(assistantId) {
  try {
    const response = await openai.beta.assistants.retrieve(assistantId);
    return response; // Return the actual assistant data
  } catch (error) {
    console.error("Error retrieving assistant:", error);
    return null; // Return null if there was an error retrieving the assistant
  }
}
  // Function to modify an assistant
  async function modifyAssistant(assistantId, changes) {
    try {
      const response = await openai.beta.assistants.update(assistantId, changes);
      console.log("Assistant updated:", response);
    } catch (error) {
      console.error("Error updating assistant:", error);
    }
  }

  // Function to delete an assistant
  async function deleteAssistant(assistantId) {
    try {
      const response = await openai.beta.assistants.del(assistantId);
      console.log("Assistant deleted:", response);
    } catch (error) {
      console.error("Error deleting assistant:", error);
    }
  }

  // Function to delete all assistants
  async function deleteAllAssistants() {
    try {
      const assistants = await listAssistants();
      assistants.forEach(async (assistant) => {
        await deleteAssistant(assistant.id);
      });
      return true;
    } catch (error) {
      console.error("Error deleting assistants:", error);
    }
    console.log("All assistants deleted.");
    console.log("Assistants: ", await listAssistants());
  }


// Function to create an assistant file by attaching a File to an assistant
async function createAssistantFile(assistantId, fileId) {
  try {
    const response = await openai.beta.assistants.files.create(assistantId, {
      file_id: fileId
    });
    console.log("Assistant file created:", response.data);
    return response; // Return the data for further processing
  } catch (error) {
    console.error("Error creating assistant file:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

  // Function to retrieve an assistant file
  async function retrieveAssistantFile(assistantId, fileId) {
    try {
      const response = await openai.beta.assistants.files.retrieve(assistantId, fileId);
      console.log("Assistant file retrieved:", response.data);
      return response; // Return the data for further processing
    } catch (error) {
      console.error("Error retrieving assistant file:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  // Function to delete an assistant file
  async function deleteAssistantFile(assistantId, fileId) {
    try {
      const response = await openai.beta.assistants.files.del(assistantId, fileId);
      //console.log("Assistant file deleted:", response);
    } catch (error) {
      console.error("Error deleting assistant file:", error);
    }
  }

  // Function to list assistant files
  async function listAssistantFiles(assistantId) {
    try {
      const response = await openai.beta.assistants.files.list(assistantId);
      return response.data;
    } catch (error) {
      console.error("Error listing assistant files:", error);
    }
  }

// Function to get assistant id
async function getActiveAssistant() {
  response = await listAssistantDetails();
  if (!response) {
    console.log('No assistant details found.');
    return null;
  }
  else {
    return response.id;
  }
}

async function listAssistants() {
  //console.log("Fetching list of assistants...");
  try {
    const response = await openai.beta.assistants.list();
    //console.log("Assistants fetched:", response.data);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.log("No assistants found or response is not an array:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error listing assistants:", error);
    return []; // Return an empty array on error
  }
}


async function listAssistantDetails() {
  try {
    const assistantsResponse = await listAssistants(); // Ensure this is awaited

    if (!assistantsResponse ) {
      console.log('No assistants found.');
      return null;
    }

    // Get the ID of the first assistant from the data array
    const assistantId = assistantsResponse[0].id; 

    const assistantResponse = await retrieveAssistant(assistantId);

    if (!assistantResponse) {
      console.log('No assistant data was returned by the retrieveAssistant function.');
      return null;
    }
    return assistantResponse; // Assuming this is the correct assistant object with an ID
    
  } catch (error) {
    console.error('Error in listing assistant details:', error);
    return null; // Return null in case of error
  }
}

  // Export all functions
  module.exports =  {
    listFiles,
    uploadFile,
    deleteFile,
    retrieveFileInfo,
    retrieveFileContent,
    createAssistant,
    retrieveAssistant,
    modifyAssistant,
    deleteAssistant,
    createAssistantFile,
    retrieveAssistantFile,
    deleteAssistantFile,
    listAssistantFiles,
    listAssistantDetails,
    listAssistants,
    getActiveAssistant,
    deleteAllAssistants,
  };
