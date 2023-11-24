/* global Toastify */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const userId = getUserIdFromURL();

    const formData = new FormData(form);
    try {
      const response = await fetch(
        '/api/v1/users/' + userId + '/uploadProfile',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();

        Toastify({
          text: data.message,
          duration: 3000,
        }).showToast();
      } else {
        console.error('Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
  // Function to extract user ID from the URL
  function getUserIdFromURL() {
    const pathArray = window.location.pathname.split('/');
    return pathArray[1];
  }
});
