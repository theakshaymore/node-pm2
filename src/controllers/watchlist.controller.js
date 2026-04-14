import { prisma } from "../config/db.js";

export async function addToWatchlist(req, res) {
  const { movieId, status, rating, notes } = req.body;

  // verify movie exist in DB
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movie) {
    return res.status(404).json({
      success: false,
      error: "movie does not exist in DB",
    });
  }

  // check if already exist in watchlist
  const movieExist = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId: {
        userId: req.user.id,
        movieId: movieId,
      },
    },
  });

  if (movieExist) {
    return res.status(400).json({
      success: false,
      error: "movie already exist in watchlist",
    });
  }

  const response = await prisma.watchlistItem.create({
    data: {
      userId: req.user.id,
      movieId,
      status: status || "PLANNED",
      rating,
      notes,
    },
  });

  return res.status(200).json({
    success: true,
    message: "movie addd to watchlist",
    response,
  });
}

export async function deleteFromWatchlist(req, res) {
  const mid = req.params.id;

  const response = await prisma.watchlistItem.findUnique({
    where: {
      id: mid,
    },
  });

  if (!response) {
    return res.status(400).json({
      success: false,
      error: "movie not found in watchlist",
    });
  }

  if (response.userId !== req.user.id) {
    return res.status(400).json({
      success: false,
      error: "you are not allowed to delete",
    });
  }

  await prisma.watchlistItem.delete({
    where: {
      id: req.params.id,
    },
  });

  return res.status(200).json({
    success: true,
    error: "movie deleted aptly from watchlist",
  });
}

export async function updateMovieFromWatchlist(req, res) {
  const { status, rating, notes } = req.body;

  const mid = req.params.id;

  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: mid },
  });

  if (!watchlistItem) {
    return res
      .status(400)
      .json({ success: false, error: "watchlist item not found" });
  }

  if (watchlistItem.userId !== req.user.id) {
    return res
      .status(400)
      .json({ success: false, error: "not allowed to update" });
  }

  const updateData = {};

  if (status !== undefined) updateData.status = status.toUpperCase();
  if (rating !== undefined) updateData.rating = rating;
  if (notes !== undefined) updateData.notes = notes;

  const updatedItem = await prisma.watchlistItem.update({
    where: { id: req.params.id },
    data: updateData,
  });

  res.status(200).json({
    status: "success",
    data: {
      watchlistItem: updatedItem,
    },
  });
}
