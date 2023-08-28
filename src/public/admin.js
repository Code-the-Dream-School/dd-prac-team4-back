document.addEventListener('DOMContentLoaded', function () {
  const updatePriceBtn = document.getElementById('updatePriceBtn');
  const newPriceInput = document.getElementById('newPrice');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  updatePriceBtn.addEventListener('click', async () => {
    // Disable the price update button to prevent multiple clicks
    updatePriceBtn.disabled = true;

    // Clear success and error messages
    successMessage.textContent = '';
    errorMessage.textContent = '';

    // Get the selected albums and the new price
    const selectedAlbums = Array.from(
      document.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    const newPrice = newPriceInput.value;

    // Form an array of objects as expected by the server
    const updates = selectedAlbums.map(albumId => ({ id: albumId, price: newPrice }));

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

      // If the update is successful, reload the page to update the data
      location.reload(true);
    } catch (error) {
      // Display an error message on the page
      errorMessage.textContent = 'An error occurred while updating prices.';
    } finally {
      // Enable the price update button after the request is complete
      updatePriceBtn.disabled = false;
    }
  });
});