require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

// Обработчик регистрации
app.post('/register', async (req, res) => {
    const { name, surname, email, password } = req.body;

    if (!name || !surname || !email || !password) {
        return res.status(400).json({ error: "Все поля обязательны!" });
    }

    const adminEmail = process.env.ADMIN_EMAIL;

    // Письмо админу с кнопками "Дать доступ" и "Отклонить"
    const mailOptions = {
        from: process.env.EMAIL,
        to: adminEmail,
        subject: 'Новый пользователь',
        html: `
            <p>Имя: ${name}</p>
            <p>Фамилия: ${surname}</p>
            <p>Email: ${email}</p>
            <p>Пароль: ${password}</p>
            <br>
            <a href="http://localhost:5000/approve?email=${email}" style="padding:10px 20px; background:green; color:white; text-decoration:none;">Дать доступ</a>
            <a href="http://localhost:5000/reject?email=${email}" style="padding:10px 20px; background:red; color:white; text-decoration:none; margin-left:10px;">Отклонить</a>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Заявка отправлена админу!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка отправки email' });
    }
});

// Обработчик "Дать доступ"
app.get('/approve', async (req, res) => {
    const userEmail = req.query.email;

    if (!userEmail) {
        return res.status(400).send('Email не указан');
    }

    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: 'Доступ одобрен',
        text: 'Ваша регистрация одобрена! Теперь вы можете войти в систему.'
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send('Пользователь одобрен, письмо отправлено!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка отправки письма');
    }
});

// Обработчик "Отклонить"
app.get('/reject', async (req, res) => {
    const userEmail = req.query.email;

    if (!userEmail) {
        return res.status(400).send('Email не указан');
    }

    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: 'Регистрация отклонена',
        text: 'Извините, ваша регистрация была отклонена.'
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send('Пользователь отклонен, письмо отправлено!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка отправки письма');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));

