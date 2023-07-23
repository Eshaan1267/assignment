const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Initialize the keyboard state
let keyboardState = new Array(10).fill({ color: 'white' });
let controlUser = null;
let controlTimeout = null;
const CONTROL_TIMEOUT_SECONDS = 120;

// Middleware to check if the user has control
function hasControl(req, res, next) {
  const { user } = req.query;
  if (user == controlUser) {
    // Reset the control timeout
    clearTimeout(controlTimeout);
    controlTimeout = setTimeout(() => {
      releaseControl();
    }, CONTROL_TIMEOUT_SECONDS * 1000);
    next();
  } else {
    res.json({ success: false });
  }
}

// API to acquire control
app.post('/acquire', (req, res) => {
  const { user } = req.body;
  if (!controlUser) {
    controlUser = user;
    clearTimeout(controlTimeout);
    controlTimeout = setTimeout(() => {
      releaseControl();
    }, CONTROL_TIMEOUT_SECONDS * 1000);
    res.json({ success: true, user: controlUser });
  } else {
    res.json({ success: false });
  }
});

// API to toggle the key color
app.post('/toggleKey', hasControl, (req, res) => {
  const { user, key } = req.body;
  const keyIndex = parseInt(key) - 1;
  if (keyboardState[keyIndex].color === 'white') {
    keyboardState[keyIndex].color = user === '1' ? 'red' : 'yellow';
  } else {
    keyboardState[keyIndex].color = 'white';
  }
  res.json({ success: true, color: keyboardState[keyIndex].color });
});

// API to get the current state of the keyboard and control
app.get('/getState', (req, res) => {
  const { user } = req.query;
  res.json({
    keyboard: keyboardState.map((key, index) => ({
      key: index + 1,
      color: key.color,
    })),
  });
});

// Function to release control
function releaseControl() {
  controlUser = null;
  clearTimeout(controlTimeout);
}

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
