document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const articleTitle = document.getElementById('articleTitle');
    const summaryElement = document.getElementById('summary');
    const generateAudioButton = document.getElementById('generateAudio');
    const audioPlayer = document.getElementById('audioPlayer');
    const audioElement = document.getElementById('audioElement');
    const audioStatus = document.getElementById('audioStatus');
    const searchSpinner = document.getElementById('searchSpinner');
    const contentSection = document.getElementById('contentSection');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const resultsCard = document.getElementById('resultsCard');
    const navigationControls = document.getElementById('navigationControls');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    // Mode switching buttons (desktop and mobile)
    const randomModeButton = document.getElementById('randomModeButton');
    const searchModeButton = document.getElementById('searchModeButton');
    const mobileSearchTab = document.getElementById('mobileSearchTab');
    const mobileRandomTab = document.getElementById('mobileRandomTab');
    
    let currentSummary = '';
    let articleHistory = [];
    let currentArticleIndex = -1;
    let isRandomMode = false;
    
    // Search Wikipedia when button is clicked
    searchButton.addEventListener('click', searchWikipedia);
    
    // Also search when Enter key is pressed
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWikipedia();
        }
    });
    
    // Generate audio when button is clicked
    generateAudioButton.addEventListener('click', generateAudio);
    
    // Navigation event listeners
    prevButton.addEventListener('click', showPreviousArticle);
    nextButton.addEventListener('click', fetchRandomArticle); // Next now fetches a new random article
    
    // Mode switchers - desktop
    randomModeButton.addEventListener('click', () => switchMode('random'));
    searchModeButton.addEventListener('click', () => switchMode('search'));
    
    // Mode switchers - mobile tabs
    mobileRandomTab.addEventListener('click', () => switchMode('random'));
    mobileSearchTab.addEventListener('click', () => switchMode('search'));
    
    // Initialize focus on search input
    searchInput.focus();
    
    function switchMode(mode) {
        const searchContainer = document.querySelector('.search-container');
        const searchSection = document.querySelector('.search-section');
        
        if (mode === 'random') {
            isRandomMode = true;
            
            // Update desktop buttons
            randomModeButton.classList.add('active');
            searchModeButton.classList.remove('active');
            
            // Update mobile tabs
            mobileRandomTab.classList.add('active');
            mobileSearchTab.classList.remove('active');
            
            // Only hide the search container, not the entire section (to keep mode switcher)
            searchContainer.classList.add('disabled');
            searchInput.disabled = true;
            searchButton.disabled = true;
            searchInput.placeholder = 'Random mode active...';
            
            // Hide welcome message immediately
            welcomeMessage.classList.add('hidden');
            
            // Show navigation controls
            navigationControls.classList.remove('hidden');
            
            if (articleHistory.length === 0) {
                fetchRandomArticle();
            } else {
                // Show existing content immediately
                contentSection.classList.remove('hidden');
            }
        } else {
            isRandomMode = false;
            
            // Update desktop buttons
            searchModeButton.classList.add('active');
            randomModeButton.classList.remove('active');
            
            // Update mobile tabs
            mobileSearchTab.classList.add('active');
            mobileRandomTab.classList.remove('active');
            
            // Show search section
            searchSection.classList.remove('hidden');
            searchContainer.classList.remove('disabled');
            searchInput.disabled = false;
            searchButton.disabled = false;
            
            // Hide navigation controls
            navigationControls.classList.add('hidden');
            
            // Clear content to focus on search
            contentSection.classList.add('hidden');
            welcomeMessage.classList.remove('hidden');
            
            // Reset search field
            searchInput.value = '';
            searchInput.placeholder = 'Search any topic...';
            searchInput.focus();
        }
    }
    
    function fetchRandomArticle() {
        // Reset UI and show spinner
        welcomeMessage.classList.add('hidden');
        contentSection.classList.add('hidden');
        searchSpinner.classList.remove('hidden');
        generateAudioButton.disabled = true;
        audioPlayer.classList.add('hidden');
        
        // Fetch a random Wikipedia article
        fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch random article');
                }
                return response.json();
            })
            .then(data => {
                // Update UI with results
                displayArticle(data);
                
                // Add to history
                articleHistory.push(data);
                currentArticleIndex = articleHistory.length - 1;
                
                // Update navigation buttons
                updateNavigationButtons();
            })
            .catch(error => {
                // Handle errors
                articleTitle.textContent = 'Error';
                summaryElement.textContent = `Could not fetch random article: ${error.message}`;
                generateAudioButton.disabled = true;
                
                // Hide spinner and show content with error message
                searchSpinner.classList.add('hidden');
                contentSection.classList.remove('hidden');
            });
    }
    
    function showPreviousArticle() {
        if (currentArticleIndex > 0) {
            currentArticleIndex--;
            displayArticle(articleHistory[currentArticleIndex]);
            updateNavigationButtons();
        }
    }
    
    function updateNavigationButtons() {
        // Previous button is only enabled if we have history to go back to
        prevButton.disabled = currentArticleIndex <= 0;
        // Next button is always enabled in random mode
        nextButton.disabled = false;
    }
    
    function displayArticle(data) {
        articleTitle.textContent = data.title;
        summaryElement.textContent = data.extract;
        currentSummary = data.extract;
        generateAudioButton.disabled = false;
        
        // Hide spinner and show content
        searchSpinner.classList.add('hidden');
        contentSection.classList.remove('hidden');
        
        // In random mode, show the navigation controls
        if (isRandomMode) {
            navigationControls.classList.remove('hidden');
        }
    }
    
    function searchWikipedia() {
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) return;
        
        // Reset UI and show spinner
        welcomeMessage.classList.add('hidden');
        contentSection.classList.add('hidden');
        navigationControls.classList.add('hidden'); // Hide navigation in search mode
        searchSpinner.classList.remove('hidden');
        generateAudioButton.disabled = true;
        audioPlayer.classList.add('hidden');
        
        // Fetch Wikipedia summary
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Article not found');
                }
                return response.json();
            })
            .then(data => {
                displayArticle(data);
                
                // If in search mode, we don't add to history
                if (isRandomMode) {
                    articleHistory.push(data);
                    currentArticleIndex = articleHistory.length - 1;
                    updateNavigationButtons();
                }
            })
            .catch(error => {
                // Handle errors
                articleTitle.textContent = 'Error';
                summaryElement.textContent = `Could not find article: ${error.message}`;
                generateAudioButton.disabled = true;
                
                // Hide spinner and show content with error message
                searchSpinner.classList.add('hidden');
                contentSection.classList.remove('hidden');
            });
    }
    
    function generateAudio() {
        if (!currentSummary) return;
        
        // Show the audio player section
        audioPlayer.classList.remove('hidden');
        audioStatus.textContent = 'Generating audio with Coqui TTS. This may take a moment...';
        audioStatus.classList.add('processing');
        generateAudioButton.disabled = true;
        
        // If in random mode, disable navigation during audio generation
        if (isRandomMode) {
            prevButton.disabled = true;
            nextButton.disabled = true;
        }
        
        // For debugging - try a simple test first
        fetch('http://localhost:5000/')
            .then(response => response.json())
            .then(data => {
                console.log('Flask server test response:', data);
                // Proceed with actual request if test passed
                return sendAudioRequest();
            })
            .catch(error => {
                console.error('Flask server test failed:', error);
                // Try the actual request anyway
                return sendAudioRequest();
            });
        
        function sendAudioRequest() {
            const shortText = currentSummary.substring(0, 500); // Limit to 500 chars
            
            console.log('Sending request to generate audio...');
            
            return fetch('http://localhost:5000/generate-audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ text: shortText }),
                mode: 'cors'
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Audio generation response:', data);
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // Set the audio source to the URL returned by the server
                const audioUrl = 'http://localhost:5000' + data.audio_url;
                console.log('Audio URL:', audioUrl);
                audioElement.src = audioUrl;
                audioStatus.textContent = 'Audio ready! Press play to listen.';
                audioStatus.classList.remove('processing');
                
                // Play automatically when ready
                audioElement.addEventListener('canplaythrough', () => {
                    console.log('Audio loaded and ready to play');
                    audioElement.play().catch(e => {
                        console.error('Auto-play prevented:', e);
                    });
                });
                
                generateAudioButton.disabled = false;
                
                // Re-enable navigation if in random mode
                if (isRandomMode) {
                    updateNavigationButtons();
                }
            })
            .catch(error => {
                console.error('Error generating audio:', error);
                audioStatus.textContent = `Error: ${error.message}. Retrying...`;
                
                // If there's an issue, let's wait 2 seconds and try again once
                setTimeout(() => {
                    audioStatus.textContent = 'Retrying audio generation...';
                    audioStatus.classList.add('processing');
                    sendAudioRequest()
                        .catch(retryError => {
                            console.error('Retry also failed:', retryError);
                            audioStatus.textContent = `TTS service error. Using fallback speech.`;
                            generateAudioButton.disabled = false;
                            
                            // Re-enable navigation if in random mode
                            if (isRandomMode) {
                                updateNavigationButtons();
                            }
                            
                            // Only use fallback after retry also fails
                            const utterance = new SpeechSynthesisUtterance(shortText);
                            utterance.onend = () => {
                                audioStatus.textContent = 'Fallback audio playback complete';
                            };
                            speechSynthesis.speak(utterance);
                            audioStatus.textContent = 'Using browser speech synthesis (fallback)';
                            audioStatus.classList.remove('processing');
                        });
                }, 2000);
            });
        }
    }
});
