import app from './app';

const port = process.env.PORT || 3293;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
