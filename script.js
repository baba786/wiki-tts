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
    
    let currentSummary = '';
    
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
    
    // Initialize focus on search input
    searchInput.focus();
    
    function searchWikipedia() {
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) return;
        
        // Reset UI and show spinner
        welcomeMessage.classList.add('hidden');
        contentSection.classList.add('hidden');
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
                // Update UI with results
                articleTitle.textContent = data.title;
                summaryElement.textContent = data.extract;
                currentSummary = data.extract;
                generateAudioButton.disabled = false;
                
                // Hide spinner and show content
                searchSpinner.classList.add('hidden');
                contentSection.classList.remove('hidden');
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
