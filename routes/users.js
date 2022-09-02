const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

//get user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...rest } = user._doc;
    if (user) {
      return res.status(200).json(rest);
    }
    return res.status(404).json('User not found');
  } catch (error) {
    return res.status(500).json(error);
  }
});

//update user
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body
      });
      return res.status(200).json("Account has been updated");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json('You can update only your account');
  }
});

//delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).json('User not found');
    }
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      try {
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json("Account has been deleted");
      } catch (error) {
        console.log(error)
        return res.status(500).json(error);
      }
    } else {
      return res.status(403).json('You can delete only your account');
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});
//follow user
router.put('/:id/follow', async (req, res) => {
  try {
    if (req.body.userId !== req.params.id) {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json('Success');
      } else {
        res.status(403).json("You already follow this user");
      }
    } else {
      res.status(403).json("You can't follow yourself");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//unfollow user
router.put('/:id/unfollow', async (req, res) => {
  try {
    if (req.body.userId !== req.params.id) {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json('Success');
      } else {
        res.status(403).json("You don't follow this user");
      }
    } else {
      res.status(403).json("You can't unfollow yourself");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;