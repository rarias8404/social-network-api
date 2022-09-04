const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

//create post
router.post('/', async (req, res) => {
  try {
    let post = new Post(req.body);
    post = await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
})

//get post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post ? res.status(200).json(post) : res.status(404).json('Not found');
  } catch (error) {
    res.status(500).json(error);
  }
})


//update post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (post.userId === req.body.userId) {
        await post.updateOne({ $set: req.body })
        res.status(200).json('Post updated');
      } else {
        res.status(403).json('You can update only your posts');
      }
    } else {
      res.status(404).json('Not found');
    }
  } catch (error) {
    res.status(500).json(error);
  }
})

//delete post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (post.userId === req.body.userId) {
        await post.deleteOne();
        res.status(200).json('Post deleted');
      } else {
        res.status(403).json('You can delete only your posts');
      }
    } else {
      res.status(404).json('Not found');
    }
  } catch (error) {
    res.status(500).json(error);
  }
})


//like or dislike post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId } })
        res.status(200).json('The post has been liked');
      } else {
        await post.updateOne({ $pull: { likes: req.body.userId } });
        res.status(200).json('The post has been disliked');
      }
    } else {
      res.status(404).json('Not found');
    }
  } catch (error) {
    res.status(500).json(error);
  }
})


//get timeline
router.get('/timeline/all', async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPost = await Promise.all(
      currentUser.followings.map(friendId => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPost));
  } catch (error) {
    res.status(500).json(error);
  }
})


module.exports = router;