// src/App.js
import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { initClient, signIn, signOut, listFilesInFolder, getSheetData } from './googleAuth';
import LoadingScreen from './LoadingScreen';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sheetData, setSheetData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNames, setFilteredNames] = useState([]);
  const [selectedName, setSelectedName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState('');

  useEffect(() => {
    const initializeGapi = async () => {
      try {
        await initClient();
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
          setIsInitialized(true);
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(setIsSignedIn);
        } else {
          throw new Error('Google Auth instance not initialized');
        }
      } catch (error) {
        console.error('Error initializing Google API client:', error);
      }
    };
    initializeGapi();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchFiles();
    }
  }, [isSignedIn]);

  const handleSignIn = async () => {
    if (!isInitialized) {
      console.error('Google Auth instance not initialized');
      return;
    }
    try {
      await signIn();
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        setIsSignedIn(authInstance.isSignedIn.get());
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    if (!isInitialized) {
      console.error('Google Auth instance not initialized');
      return;
    }
    try {
      await signOut();
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        setIsSignedIn(authInstance.isSignedIn.get());
      }
      setSheetData([]);
      setSearchTerm('');
      setFilteredNames([]);
      setSelectedName(null);
      setIsLoading(true);
      // Clear session to prompt for new permissions on next sign-in
      authInstance.disconnect();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const fetchedFiles = await listFilesInFolder('June');

      // Get today's date in the format "DD-MM-YYYY"
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
      const year = today.getFullYear();
      const todayFormatted = `${day}-${month}-${year}`;

      // Find the sheet that corresponds to today's date
      const todaySheet = fetchedFiles.find(file => file.name.includes(todayFormatted));
      if (todaySheet) {
        setDate(todaySheet.name.split(' ')[0]);
        const data = await getSheetData(todaySheet.id, todaySheet.name);
        if (data) {
          setSheetData(data.slice(2)); // Assuming the first two rows are headers
          setIsLoading(false);
        } else {
          setSheetData([]);
          setIsLoading(false);
          console.error('No data found for today\'s sheet');
        }
      } else {
        setSheetData([]);
        setIsLoading(false);
        console.error('No sheet found for today');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching files:', error);
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.length > 0) {
      const filtered = sheetData.filter(row => row[1] && row[1].toLowerCase().includes(term.toLowerCase()));
      setFilteredNames(filtered);
    } else {
      setFilteredNames([]);
    }
  };

  const handleSelectName = (name) => {
    setSelectedName(name);
    setSearchTerm(name[1]);
    setFilteredNames([]);
  };

  return (
    <AnimatePresence>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <motion.div
          className="container mx-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <h1 className="text-2xl font-bold mb-4">Google Drive Files</h1>
          <h1 className="text-xl font-bold mb-4">{date}</h1>
          {!isSignedIn ? (
            <button
              onClick={handleSignIn}
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Sign In
            </button>
          ) : (
            <div>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white py-2 px-4 rounded ml-2"
              >
                Sign Out
              </button>
              <div className="mt-4">
                <div className="mb-4">
                  <input
                    type="text"
                    className="border p-2 w-full"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  {filteredNames.length > 0 && (
                    <ul className="border mt-2 max-h-48 overflow-y-auto">
                      {filteredNames.map((name, index) => (
                        <li
                          key={index}
                          className="p-2 cursor-pointer hover:bg-gray-200"
                          onClick={() => handleSelectName(name)}
                        >
                          {name[1]}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {selectedName && (
                  <div className="mt-4 p-4 border rounded">
                    <h2 className="text-xl font-bold mb-4">{selectedName[1]}</h2>
                    <p><strong>Breakfast:</strong> {selectedName[2]}</p>
                    <p><strong>Lunch:</strong> {selectedName[3]}</p>
                    <p><strong>Dinner:</strong> {selectedName[4]}</p>
                    <p><strong>Preference:</strong> {selectedName[5]}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
