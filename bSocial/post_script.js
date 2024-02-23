// frontend.js

// Function to fetch and display posts
async function fetchPosts() {
    try {
      const response = await fetch('http://localhost:3000/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Error fetching posts');
      }
  
      const posts = await response.json();
  
      // Display posts on the page
      displayPosts(posts);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  // Function to display posts on the page
  function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
  
    // Clear previous content
    postsContainer.innerHTML = '';
  
    // Loop through each post and display it
    posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.innerHTML = `<strong>${post.username}</strong>: ${post.message}`;
  
      // Display comments for the post
      if (post.comments && post.comments.length > 0) {
        const commentsList = document.createElement('ul');
        post.comments.forEach(comment => {
          const commentItem = document.createElement('li');
          commentItem.innerHTML = `<strong>${comment.senderUsername}</strong>: ${comment.content}`;
          commentsList.appendChild(commentItem);
        });
  
        postElement.appendChild(commentsList);
      }
  
      postsContainer.appendChild(postElement);
    });
  }
  