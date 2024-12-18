import express from 'express';
import next from 'next';
import { Server } from 'socket.io';

import { createServer } from 'node:http';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

const schema = await fs.promises.readFile('sqlite_quizdb.sql', 'utf-8');

const db = await open({
    filename: 'quiz.db',
    driver: sqlite3.Database
});

const QuizStatus = {
    NotStarted: 0,
    Running: 1,
    Finished: 2
}

await db.exec(schema);

const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev })
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);
    const io = new Server(httpServer, {
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000,
            skipMiddlewares: true
        }
    })

    server.get('*', (req, res) => handler(req, res));

    io.on('connection', (socket) => {
        socket.on('get-quiz', async (quizId) => {
            const quiz = await db.get('SELECT * FROM quiz_session where id = ?', quizId);
            socket.emit('quiz-data', quiz)

        })

        socket.on('get-quiz-scores',async(quizId)=>{
            const scoreboard = await getScores(quizId);
            socket.emit("quiz-scores", { quiz_id: quizId, scores: scoreboard });
        })

        socket.on('start-quiz', async (quiz_id) => {
            try {
                await db.run('UPDATE quiz_session SET status = ? WHERE id = ?', [QuizStatus.Running, quiz_id]);
                io.emit('quiz-started', { quiz_id });

                const quizItems = await db.all(`SELECT qi.quiz_id, qi.question, qi.answer_a, qi.answer_b, qi.answer_c, qi.answer_d, qi.time_limit_by_second 
                    FROM quiz_item qi 
                    JOIN quiz_session qs ON qi.quiz_id = qs.quiz_id 
                    WHERE qs.id = ? AND qs.status = ?
                    ORDER BY item_order ASC`, [quiz_id, QuizStatus.Running]);
                io.emit('quiz-items', { quiz_id, items: quizItems })
            }
            catch (e) {
                console.error('Error when updating quiz_session status', error);
                socket.emit('error', { errorCode: 'QUIZ_START_ERROR', message: 'Fail to start quiz session', quiz_id })
            }
        })

        socket.on('submit-answers', async ({ userName, quizId, answers }) => {
            const correctAnswers = await db.all(`SELECT qi.id, qi.correct_answer 
                FROM quiz_item qi
                WHERE qi.quiz_id = ?
                ORDER BY item_order ASC`, quizId)

            if (correctAnswers.length != Object.keys(answers).length) {
                console.log('error: Unexpected answers')
                socket.emit('error', { errorCode: 'WRONG_ANSWER', message: 'Unexpected answers.' })
                return;
            }

            // Insert user data && get user id
            await db.run("INSERT INTO users (name, socket_id, created_date) VALUES (?,?,DATETIME('now'))", [userName, socket.id]);
            const user = await db.get("SELECT id FROM users ORDER BY id DESC LIMIT 1")
            const userId = user.id;

            // Calculate score and insert answer into db
            let score = 0;
            for (let i = 0; i < correctAnswers.length; i++) {
                await db.run("INSERT INTO quiz_answers (quiz_session_id, user_id, quiz_item_id, answer, created_date) VALUES (?,?,?,?,DATETIME('now'))", [quizId, userId, correctAnswers[i].id, Object.values(answers)[i]]);
                if (answers[i] == correctAnswers[i].correct_answer) {
                    score += 10;
                }
            }

            // Insert the score into the scoreboard
            await db.run("INSERT INTO quiz_scoreboard (quiz_session_id, user_id, score) VALUES (?,?,?)", [quizId, userId, score]);

            // Broadcast the updated scoreboard
            const scoreboard = await getScores(quizId);
            io.emit("quiz-scores", { quiz_id: quizId, scores: scoreboard });
        })

        socket.on('disconnect', () => {
            console.log('user disconnected');
        })
    })

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Listening on http://localhost:${PORT}`);
    })
})

const getScores = async (quizId) => {
    const scoreboardSize = 10;
    const scoreboard = await db.all(`SELECT qsb.quiz_session_id, u.name as user_name, qsb.score 
            FROM quiz_scoreboard qsb
            JOIN users u ON qsb.user_id = u.id
            WHERE quiz_session_id = ? ORDER BY score DESC LIMIT ?`, [quizId, scoreboardSize]);
    return scoreboard;
}