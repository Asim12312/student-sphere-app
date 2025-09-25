import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3000/post';

// Async thunks
export const likePost = createAsyncThunk(
  'clubPosts/likePost',
  async ({ postId, userId }) => {
    const response = await axios.post(`${API_URL}/likeUnlikePost`, {
      postId,
      userId,
      action: 'like'
    });
    return response.data;
  }
);

export const dislikePost = createAsyncThunk(
  'clubPosts/dislikePost',
  async ({ postId, userId }) => {
    const response = await axios.post(`${API_URL}/likeUnlikePost`, {
      postId,
      userId,
      action: 'dislike'
    });
    return response.data;
  }
);

export const getPostReactions = createAsyncThunk(
  'clubPosts/getPostReactions',
  async ({ postIds, userId }) => {
    const response = await axios.post(`${API_URL}/getPostReactions`, {
      postIds,
      userId
    });
    return response.data;
  }
);

const clubPostsSlice = createSlice({
  name: 'clubPosts',
  initialState: {
    posts: [],
    reactions: {},
    loading: false,
    error: null
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    updatePostReactions: (state, action) => {
      const { postId, reactions } = action.payload;
      state.reactions[postId] = reactions;
    },
    clearReactions: (state) => {
      state.reactions = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // Like post
      .addCase(likePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.loading = false;
        const { post } = action.payload;
        state.reactions[post._id] = {
          likes: post.likes,
          dislikes: post.dislikes,
          userLiked: post.userLiked,
          userDisliked: post.userDisliked
        };
      })
      .addCase(likePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Dislike post
      .addCase(dislikePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(dislikePost.fulfilled, (state, action) => {
        state.loading = false;
        const { post } = action.payload;
        state.reactions[post._id] = {
          likes: post.likes,
          dislikes: post.dislikes,
          userLiked: post.userLiked,
          userDisliked: post.userDisliked
        };
      })
      .addCase(dislikePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Get post reactions
      .addCase(getPostReactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPostReactions.fulfilled, (state, action) => {
        state.loading = false;
        const { reactions } = action.payload;
        reactions.forEach(reaction => {
          state.reactions[reaction.postId] = {
            likes: reaction.likes,
            dislikes: reaction.dislikes,
            userLiked: reaction.userLiked,
            userDisliked: reaction.userDisliked
          };
        });
      })
      .addCase(getPostReactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

// Selectors
export const selectPostReactions = (state) => state.clubPosts.reactions;
export const selectPostReaction = (postId) => (state) => 
  state.clubPosts.reactions[postId] || { likes: 0, dislikes: 0, userLiked: false, userDisliked: false };
export const selectClubPostsLoading = (state) => state.clubPosts.loading;
export const selectClubPostsError = (state) => state.clubPosts.error;

// Actions
export const { setPosts, updatePostReactions, clearReactions } = clubPostsSlice.actions;

export default clubPostsSlice.reducer;
