const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      `/api/clubs/${clubId}/posts`,
      { title, content },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    // ...rest of code...
  } catch (error) {
    console.error('Error creating post:', error);
  }
};