import { gapi } from 'gapi-script';

const CLIENT_ID = "GIVE THE CLIENT ID";
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly';
;

export const initClient = () => {
  return new Promise((resolve, reject) => {
    console.log('Loading gapi client...');
    gapi.load('client:auth2', () => {
      console.log('Initializing gapi client...');
      gapi.auth2.init({
        client_id: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        console.log('gapi client initialized.');
        // Load the Drive API explicitly
        gapi.client.load('drive', 'v3', () => {
          console.log('Drive API loaded.');
          gapi.client.load('sheets', 'v4', () => {
            console.log('Sheets API loaded.');
            resolve();
          });
        });
      }).catch((error) => {
        console.error('Error initializing gapi client:', error);
        reject(error);
      });
    });
  });
};
export const signIn = () => {
  const authInstance = gapi.auth2.getAuthInstance();
  if (authInstance) {
    console.log('Signing in...');
    return authInstance.signIn();
  } else {
    console.error('Google Auth instance not initialized');
    return Promise.reject(new Error('Google Auth instance not initialized'));
  }
};
export const signOut = () => {
  const authInstance = gapi.auth2.getAuthInstance();
  if (authInstance) {
    console.log('Signing out...');
    return authInstance.signOut();
  } else {
    console.error('Google Auth instance not initialized');
    return Promise.reject(new Error('Google Auth instance not initialized'));
  }
};

export const listFilesInFolder = async (folderName) => {
  try {
    console.log('Locating folder 2024...');
    const response2024 = await gapi.client.drive.files.list({
      q: "name = '2024' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name)',
    });

    console.log('Response 2024:', response2024);
    console.log('Response 2024 JSON:', JSON.stringify(response2024, null, 2));

    if (response2024.result && response2024.result.files && response2024.result.files.length > 0) {
      const folder2024Id = response2024.result.files[0].id;

      console.log('Locating folder June inside 2024...');
      const responseJune = await gapi.client.drive.files.list({
        q: `name = 'June' and mimeType = 'application/vnd.google-apps.folder' and '${folder2024Id}' in parents and trashed = false`,
        fields: 'files(id, name)',
      });

      console.log('Response June:', responseJune);
      console.log('Response June JSON:', JSON.stringify(responseJune, null, 2));

      if (responseJune.result && responseJune.result.files && responseJune.result.files.length > 0) {
        const folderJuneId = responseJune.result.files[0].id;

        console.log('Locating folder DayWiseSheets inside June...');
        const responseDayWiseSheets = await gapi.client.drive.files.list({
          q: `name = 'DayWiseSheets' and mimeType = 'application/vnd.google-apps.folder' and '${folderJuneId}' in parents and trashed = false`,
          fields: 'files(id, name)',
        });

        console.log('Response DayWiseSheets:', responseDayWiseSheets);
        console.log('Response DayWiseSheets JSON:', JSON.stringify(responseDayWiseSheets, null, 2));

        if (responseDayWiseSheets.result && responseDayWiseSheets.result.files && responseDayWiseSheets.result.files.length > 0) {
          const folderDayWiseSheetsId = responseDayWiseSheets.result.files[0].id;

          console.log('Listing sheets in the DayWiseSheets folder...');
          const sheetsResponse = await gapi.client.drive.files.list({
            q: `'${folderDayWiseSheetsId}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
            fields: 'files(id, name, mimeType)',
          });

          console.log('Sheets Response:', sheetsResponse);
          console.log('Sheets Response JSON:', JSON.stringify(sheetsResponse, null, 2));

          if (sheetsResponse.result && sheetsResponse.result.files) {
            return sheetsResponse.result.files;
          } else {
            console.error('No sheets found in the DayWiseSheets folder');
            return [];
          }
        } else {
          console.error('DayWiseSheets folder not found inside June folder');
          return [];
        }
      } else {
        console.error('June folder not found inside 2024 folder');
        return [];
      }
    } else {
      console.error('2024 folder not found');
      return [];
    }
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

export const getSheetData = async (spreadsheetId,sheetName) => {
  try {
    console.log('Fetching sheet data...');
    console.log('Fetching sheet data with the following parameters:');
    console.log('Spreadsheet ID:', spreadsheetId);
    console.log(`Range: ${sheetName}!A:F`);
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:F`, // Adjust the range as needed
    });

    console.log('Sheet Data Response:', response);
    return response.result.values;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return null;
  }
};
