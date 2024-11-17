// Check if service workers are supported
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Register the service worker
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      }).catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    });
  }
  
  // Handle the "Add to Home Screen" (Install) prompt
  let deferredPrompt;
  const installButton = document.getElementById('install-button');
  
  // Listen for the "beforeinstallprompt" event
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the default prompt
    event.preventDefault();
    deferredPrompt = event;
  
    // Show the install button
    installButton.style.display = 'block';
  
    // Add event listener to the install button
    installButton.addEventListener('click', () => {
      // Show the install prompt
      deferredPrompt.prompt();
  
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        console.log(choiceResult.outcome);
        deferredPrompt = null;
      });
    });
  });
  