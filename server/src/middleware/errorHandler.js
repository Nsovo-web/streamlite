export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const notFound = (req, res) => res.status(404).json({ message: 'Route not found' });

export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  if (err.name === 'CastError') status = 400; // bad ObjectId
  if (err.isAxiosError) status = 502; // TMDB failure
  if (status >= 500) console.error(err);
  const message = status >= 500 ? 'Server error' : err.message;
  res.status(status).json({ message });
}