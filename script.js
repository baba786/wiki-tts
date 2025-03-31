document.addEventListener('DOMContentLoaded', () => {
    // Position the audio button correctly from the start
    const articleControls = document.querySelector('.article-controls');
    if (articleControls) {
        articleControls.style.display = 'block';
    }
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
    const randomModeTitle = document.getElementById('randomModeTitle');
    const swipeUpHint = document.getElementById('swipeUpHint');
    const swipeDownHint = document.getElementById('swipeDownHint');
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
    
    // Variable to track if body scroll is disabled
    let isBodyScrollDisabled = false;
    
    // Function to disable body scroll
    function disableBodyScroll() {
        if (!isBodyScrollDisabled) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            isBodyScrollDisabled = true;
        }
    }
    
    // Function to enable body scroll
    function enableBodyScroll() {
        if (isBodyScrollDisabled) {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            isBodyScrollDisabled = false;
        }
    }
    
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
            
            // Hide the search container in random mode
            searchContainer.classList.add('hidden');
            
            // Hide welcome message immediately
            welcomeMessage.classList.add('hidden');
            
            // Apply shorts-mode styling to the card
            resultsCard.classList.add('shorts-mode');
            
            // Show navigation controls but keep title hidden for a cleaner shorts-like experience
            navigationControls.classList.remove('hidden');
            
            // On mobile, disable body scrolling to create a more immersive shorts experience
            if (isMobileDevice()) {
                disableBodyScroll();
                initSwipeHandlers();
            }
            
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
            
            // Remove shorts-mode styling
            resultsCard.classList.remove('shorts-mode');
            
            // Show search section
            searchSection.classList.remove('hidden');
            searchContainer.classList.remove('hidden');
            searchInput.disabled = false;
            searchButton.disabled = false;
            
            // Hide navigation controls and random mode title
            navigationControls.classList.add('hidden');
            randomModeTitle.classList.add('hidden');
            
            // Re-enable body scrolling and remove swipe handlers when exiting random mode
            if (isMobileDevice()) {
                enableBodyScroll();
                removeSwipeHandlers();
            }
            
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
        // Add animation class if in shorts mode and on mobile
        if (isRandomMode && isMobileDevice() && !contentSection.classList.contains('hidden')) {
            resultsCard.classList.add('animating-up');
            
            // Wait for animation to complete before fetching new content
            setTimeout(() => {
                resultsCard.classList.remove('animating-up');
                fetchRandomArticleContent();
            }, 300);
        } else {
            fetchRandomArticleContent();
        }
    }
    
    function fetchRandomArticleContent() {
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
                // Add to history
                articleHistory.push(data);
                currentArticleIndex = articleHistory.length - 1;
                
                // Update UI with results
                if (isRandomMode && isMobileDevice()) {
                    // First set opacity to 0 for all animated elements
                    if (articleTitle) articleTitle.style.opacity = '0';
                    if (summaryElement) summaryElement.style.opacity = '0';
                    
                    resultsCard.classList.add('animating-in');
                    setTimeout(() => {
                        displayArticle(data);
                        updateNavigationButtons();
                        
                        // Animation will automatically reveal content
                        // with cascading timing
                        
                        // Remove animation classes after complete
                        setTimeout(() => {
                            resultsCard.classList.remove('animating-in');
                            // Reset opacities
                            if (articleTitle) articleTitle.style.opacity = '';
                            if (summaryElement) summaryElement.style.opacity = '';
                        }, 1000);
                    }, 50);
                } else {
                    displayArticle(data);
                    updateNavigationButtons();
                }
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
            // Add animation if in shorts mode on mobile
            if (isRandomMode && isMobileDevice()) {
                resultsCard.classList.add('animating-down');
                
                setTimeout(() => {
                    resultsCard.classList.remove('animating-down');
                    currentArticleIndex--;
                    
                    // First set opacity to 0 for all animated elements
                    if (articleTitle) articleTitle.style.opacity = '0';
                    if (summaryElement) summaryElement.style.opacity = '0';
                    
                    resultsCard.classList.add('animating-in');
                    setTimeout(() => {
                        displayArticle(articleHistory[currentArticleIndex]);
                        updateNavigationButtons();
                        
                        // Animation will automatically reveal content with cascading timing
                        
                        // Remove animation classes after complete
                        setTimeout(() => {
                            resultsCard.classList.remove('animating-in');
                            // Reset opacities
                            if (articleTitle) articleTitle.style.opacity = '';
                            if (summaryElement) summaryElement.style.opacity = '';
                        }, 1000);
                    }, 50);
                }, 300);
            } else {
                currentArticleIndex--;
                displayArticle(articleHistory[currentArticleIndex]);
                updateNavigationButtons();
            }
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
        
        // In random mode on desktop, show the navigation controls
        if (isRandomMode && !isMobileDevice()) {
            navigationControls.classList.remove('hidden');
        } else if (isRandomMode && isMobileDevice()) {
            // On mobile in random mode, hide navigation controls (we use swipe instead)
            navigationControls.classList.add('hidden');
            // No longer showing swipe hints
        }
        
        // If in shorts mode and audio player is visible, position it appropriately
        if (isRandomMode && !audioPlayer.classList.contains('hidden')) {
            audioPlayer.classList.add('shorts-audio-player');
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
        
        // Don't disable the button, just show it's processing
        generateAudioButton.classList.add('processing-audio');
        
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
                
                // Remove the processing animation
                generateAudioButton.classList.remove('processing-audio');
                
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

    // Helper function to detect mobile devices
    function isMobileDevice() {
        return (window.innerWidth <= 768) || 
               ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }

    // Variables for touch handling
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartTime = 0;
    let isSwiping = false;
    const minSwipeDistance = 60; // Reduced to make swiping easier
    const maxSwipeTime = 500; // Maximum time in ms for a swipe to be considered valid
    const maxHorizontalMove = 50; // Maximum horizontal movement to still consider it a vertical swipe
    
    // Initialize swipe handlers
    function initSwipeHandlers() {
        // No longer showing swipe hints
        // Just add touch event listeners
        resultsCard.addEventListener('touchstart', handleTouchStart, { passive: false });
        resultsCard.addEventListener('touchmove', handleTouchMove, { passive: false });
        resultsCard.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // On mobile, hide the navigation buttons and use swipe instead
        if (navigationControls) {
            navigationControls.classList.add('hidden');
        }
        
        // Add a class to the body to identify shorts mode
        document.body.classList.add('shorts-mode-active');
    }
    
    // Remove swipe handlers
    function removeSwipeHandlers() {
        resultsCard.removeEventListener('touchstart', handleTouchStart, { passive: false });
        resultsCard.removeEventListener('touchmove', handleTouchMove, { passive: false });
        resultsCard.removeEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Hide swipe hints
        swipeUpHint.classList.remove('visible');
        swipeDownHint.classList.remove('visible');
        
        // Remove shorts mode class from body
        document.body.classList.remove('shorts-mode-active');
    }
    
    // Handle touch start event
    function handleTouchStart(event) {
        touchStartY = event.touches[0].clientY;
        touchStartX = event.touches[0].clientX;
        touchStartTime = new Date().getTime();
        isSwiping = false;
        
        // Don't prevent default here to allow scrolling within summary
    }
    
    // Handle touch move event (new)
    function handleTouchMove(event) {
        if (event.touches.length > 0) {
            const currentY = event.touches[0].clientY;
            const currentX = event.touches[0].clientX;
            const deltaY = currentY - touchStartY;
            const deltaX = Math.abs(currentX - touchStartX);
            const summaryElement = document.querySelector('.shorts-mode .summary');
            
            // Check if this is looking like a vertical swipe (more vertical than horizontal)
            if (Math.abs(deltaY) > 30 && deltaX < 30) {
                // If we're at the top of content and swiping down, or bottom and swiping up
                // then it's likely a shorts navigation swipe
                const isAtTop = summaryElement.scrollTop <= 0;
                const isAtBottom = summaryElement.scrollHeight - summaryElement.scrollTop <= summaryElement.clientHeight + 10;
                
                if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
                    isSwiping = true;
                    event.preventDefault(); // Prevent default only when we're sure it's a navigation swipe
                }
            }
        }
    }
    
    // Handle touch end event
    function handleTouchEnd(event) {
        touchEndY = event.changedTouches[0].clientY;
        touchEndX = event.changedTouches[0].clientX;
        const touchEndTime = new Date().getTime();
        const touchDuration = touchEndTime - touchStartTime;
        
        // Only process as a swipe if timing is right and it wasn't a long press
        if (touchDuration < maxSwipeTime) {
            handleSwipe();
        }
    }
    
    // Process the swipe gesture
    function handleSwipe() {
        const swipeDistanceY = touchEndY - touchStartY;
        const swipeDistanceX = Math.abs(touchEndX - touchStartX);
        const summaryElement = document.querySelector('.shorts-mode .summary');
        
        // Only count as a swipe if vertical distance is significant and horizontal movement is minimal
        if (Math.abs(swipeDistanceY) > minSwipeDistance && swipeDistanceX < maxHorizontalMove) {
            const isAtTop = summaryElement.scrollTop <= 0;
            const isAtBottom = summaryElement.scrollHeight - summaryElement.scrollTop <= summaryElement.clientHeight + 10;
            
            if (swipeDistanceY < 0 && (isAtBottom || isSwiping)) {
                // Swipe up - next article
                fetchRandomArticle();
                return true;
            } else if (swipeDistanceY > 0 && (isAtTop || isSwiping)) {
                // Swipe down - previous article
                if (currentArticleIndex > 0) {
                    showPreviousArticle();
                    return true;
                }
            }
        }
        return false;
    }
    
    // Show a swipe hint briefly
    function showSwipeHint(hintElement) {
        // Make the hint visible
        hintElement.style.display = 'flex';
        hintElement.classList.add('visible');
        
        // Hide after a short delay
        setTimeout(() => {
            hintElement.classList.remove('visible');
            setTimeout(() => {
                hintElement.style.display = 'none';
            }, 300); // Match the CSS transition duration
        }, 1200);
    }
});

