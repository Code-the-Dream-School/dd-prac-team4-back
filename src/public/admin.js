document.addEventListener('DOMContentLoaded', function () {
  const updatePriceBtn = document.getElementById('updatePriceBtn');
  const newPriceInput = document.getElementById('newPrice');
  const messageContainer = document.getElementById('messageContainer');

  updatePriceBtn.addEventListener('click', async () => {
    // Disable the price update button to prevent multiple clicks
    updatePriceBtn.disabled = true;

    // Clear the message container
    messageContainer.textContent = '';

    // Get the selected albums and the new price
    const selectedAlbums = Array.from(
      document.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    const newPrice = newPriceInput.value;

    // Check if any albums are selected
    if (selectedAlbums.length === 0) {
      messageContainer.textContent = 'Please select albums to update.';
      messageContainer.classList.add('error-message');
      updatePriceBtn.disabled = false;
      return; // Don't proceed with the request
    }

    // Form an array of objects as expected by the server
    const updates = selectedAlbums.map((albumId) => ({
      id: albumId,
      price: newPrice,
    }));

    // Send a request to the server
    try {
      const response = await fetch('admin/api/albums', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates), // Send an array of objects
      });

      if (!response.ok) {
        throw new Error('Failed to update prices.');
      }

      // If the update is successful, display a success message
      messageContainer.textContent = 'Successful!';
      messageContainer.classList.add('success-message');

      // Reload the page to update the data
      location.reload(true);
    } catch (error) {
      // Display an error message on the page
      messageContainer.textContent = 'Not Successful!';
      messageContainer.classList.add('error-message');
    } finally {
      // Enable the price update button after the request is complete
      updatePriceBtn.disabled = false;
    }
  });
});
