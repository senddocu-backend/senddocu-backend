const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', source: 'sanity' });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('SANITY SERVER LISTENING ON 3000');
});
