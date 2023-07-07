var express = require('express');
var router = express.Router();
// var Book = require('../models/v2book');
var Book = require('../models/book');
var Comment = require('../models/comment');
// const books = [];

router.get('/', (req, res, next) => {
  Book.find({})
    .populate('comments')
    .then((books) => {
      res.json({ books });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.post('/', (req, res, next) => {
  
  Book.create(req.body)
    .then((createBook) => {
      res.status(201).json(createBook);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
 
});

router.get('/:id', (req, res) => {
  const bookId = req.params.id;
  Book.findById(bookId)
    .then((book) => {
      if (book) {
        res.json(book);
      } else {
        res.status(404).json({ error: 'Book not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.put('/:id', (req, res) => {
  let bookId = req.params.id;
  Book.findByIdAndUpdate(bookId, req.body)
    .then((updatedBook) => {
      if (updatedBook) {
        res.status(200).json(updatedBook);
      } else {
        res.status(404).json({ error: 'Book not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.post('/:id/comments', (req, res, next) => {
  var id = req.params.id;
  req.body.bookId = id;

  Comment.create(req.body).then((comment) => {
    Book.findByIdAndUpdate(
      id,
      {
        $push: { comments: comment._id },
      },
      { new: true }
    )
      .then((updateBook) => {
        res.json({updateBook});
      })

      .catch((error) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
  });
});

router.delete('/:id', (req, res) => {
  let bookId = req.params.id;
  Book.findByIdAndDelete(bookId)
    .then((deleteBook) => {
      if (deleteBook) {
        res.status.json(deleteBook);
      } else {
        res.status(404).json({ error: 'Book not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});



module.exports = router;
