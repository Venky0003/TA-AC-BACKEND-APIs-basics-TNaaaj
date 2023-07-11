var express = require('express');
var router = express.Router();
var Book = require('../models/book');
var Comment = require('../models/comment');


router.get('/', (req, res, next) => {
  Book.find({})
    .populate('comments')
    .then((books) => {
      res.json({ books });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

router.post('/', (req, res, next) => {
  //   Save the new book to the database
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
      res.status(500).json(error);
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
      res.status(500).json(error);
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
        res.json({ updateBook });
      })

      .catch((error) => {
        res.status(500).json(error);
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
      res.status(500).json(error);
    });
});

// for listing all the categories
router.get('/categories/books', (req, res, next) => {
  Book.distinct('categories')
    .then((categories) => {
      res.status(200).json(categories);
    })
    .catch((error) => {
      res.status.json(error);
    });
});

// for listing books by category
router.get('/categories/:categoryName', (req, res, next) => {
  var categoryName = req.params.categoryName;
  Book.find({ categories: { $regex: categoryName, $options: 'i' } })
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

// for listing books by author
router.get('/authors/:authorName', (req, res) => {
  var authorName = req.params.authorName;

  Book.find({ author: { $regex: authorName, $options: 'i' } })
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

// for the count of certain category books
router.get('/categories/:categoryName/count', (req, res) => {
  var categoryName = req.params.categoryName;

  Book.aggregate([
    { $match: { categories: { $regex: categoryName, $options: 'i' } } },
    { $group: { _id: '$categories', count: { $sum: 1 } } },
  ])
    .then((result) => {
      if (result.length === 0) {
        res.status(404).json({ error: 'No categories found' });
      } else {
        res.status(200).json(result);
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

// for tags
router.get('/tags/books', (req, res) => {
  Book.distinct('tags')
    .then((tags) => {
      if (tags.length === 0) {
        res.status(404).json({ error: 'No tags found' });
      } else {
        res.json(tags);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});


// for tags ascending or descending order
router.get('/tags/sort/:order', (req, res, next) => {
  let { order } = req.params;

  // for asceding and descending
  let sort = order === 'ascending' ? 1 : -1;

  Book.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags' } },
    { $sort: { _id: sort } },
  ])
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});


// for finding based on tagname
router.get('/tags/books/:tagName', (req, res, next) => {
  var tagName = req.params.tagName;

  Book.find({ tags: { $regex: tagName, $options: 'i' } })
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});


// for count based on tag name
router.get('/tags/:tagName/count', (req, res) => {
  var tagName = req.params.tagName;

  Book.aggregate([
    { $match: { tags: { $regex: tagName, $options: 'i' } } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ])
    .then((result) => {
      if (result.length === 0) {
        res.status(404).json({ error: 'No tags found' });
      } else {
        res.status(200).json(result);
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

module.exports = router;
