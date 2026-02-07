import express from 'express';
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
    res.send('Hello');
});

app.listen(PORT, () => {
    console.log('Test server running on port 3001');
});
