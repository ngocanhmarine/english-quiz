DROP TABLE IF EXISTS quiz;
CREATE TABLE IF NOT EXISTS quiz (
  id INTEGER PRIMARY KEY,
  name TEXT,
  created_date TIMESTAMP,
  creator INTEGER,
  FOREIGN KEY (creator) REFERENCES users(id)
);

DROP TABLE IF EXISTS quiz_item;
CREATE TABLE IF NOT EXISTS quiz_item (
  id INTEGER PRIMARY KEY,
  quiz_id INTEGER,
  question TEXT,
  answer_a TEXT,
  answer_b TEXT,
  answer_c TEXT,
  answer_d TEXT,
  correct_answer INTEGER,
  item_order INTEGER,
  time_limit_by_second INTEGER,
  created_date TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quiz(id)
);

DROP TABLE IF EXISTS quiz_session;
CREATE TABLE IF NOT EXISTS quiz_session (
  id INTEGER PRIMARY KEY,
  quiz_id INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status INTEGER,
  created_date TIMESTAMP,
  creator INTEGER,
  FOREIGN KEY (quiz_id) REFERENCES quiz(id),
  FOREIGN KEY (creator) REFERENCES users(id)
);

DROP TABLE IF EXISTS quiz_scoreboard;
CREATE TABLE IF NOT EXISTS quiz_scoreboard (
  id INTEGER PRIMARY KEY,
  quiz_session_id INTEGER,
  user_id INTEGER,
  score INTEGER,
  FOREIGN KEY (quiz_session_id) REFERENCES quiz_session(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS quiz_answers;
CREATE TABLE IF NOT EXISTS quiz_answers (
  quiz_session_id INTEGER,
  user_id INTEGER,
  quiz_item_id INTEGER,
  answer INTEGER,
  created_date TIMESTAMP,
  PRIMARY KEY (quiz_session_id, user_id, quiz_item_id),
  FOREIGN KEY (quiz_session_id) REFERENCES quiz_session(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quiz_item_id) REFERENCES quiz_item(id)
);

DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  socket_id TEXT,
  created_date TIMESTAMP
);

INSERT INTO quiz (name, created_date, creator) VALUES ('English Quiz', DATETIME('now'), 1);

INSERT INTO quiz_item (quiz_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, item_order, time_limit_by_second, created_date)
VALUES 
( (SELECT id FROM quiz ORDER BY id DESC LIMIT 1), 'What is the capital of England?', 'London', 'Paris', 'Berlin', 'Madrid', 1, 1, 30, DATETIME('now')),
( (SELECT id FROM quiz ORDER BY id DESC LIMIT 1), 'Which of these is a verb?', 'Apple', 'Run', 'Table', 'Chair', 2, 2, 30, DATETIME('now')),
( (SELECT id FROM quiz ORDER BY id DESC LIMIT 1), 'What is the synonym of "happy"?', 'Sad', 'Angry', 'Joyful', 'Fearful', 3, 3, 30, DATETIME('now')),
( (SELECT id FROM quiz ORDER BY id DESC LIMIT 1), 'Which word is an adjective?', 'Quickly', 'Run', 'Happy', 'Quick', 4, 4, 30, DATETIME('now')),
( (SELECT id FROM quiz ORDER BY id DESC LIMIT 1), 'What is the antonym of "cold"?', 'Hot', 'Warm', 'Cool', 'Freezing', 1, 5, 30, DATETIME('now'));

INSERT INTO quiz_session (quiz_id, start_date, end_date, status, created_date, creator)
VALUES ((SELECT id FROM quiz ORDER BY id DESC LIMIT 1), DATETIME('now', '+10 minutes'), DATETIME('now', '+1 day'), 1, DATETIME('now'), 1);
