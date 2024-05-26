const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/register', async (req, res) => {
  const { firstName, lastName, email, birthday } = req.body;

  try {
    // Simpan data pengguna ke MySQL
    const [result] = await pool.query('INSERT INTO users (firstName, lastName, email, birthday) VALUES (?, ?, ?, ?)', [firstName, lastName, email, birthday]);

    // Kirim email konfirmasi
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: `Selamat Datang, ${firstName} ${lastName}!`,
      text: `Selamat bergabung di platform kami. Semoga Anda menikmati pengalaman menggunakan layanan kami.`,
    };

    await transporter.sendMail(mailOptions);

    console.log('Registrasi berhasil. Email konfirmasi telah dikirim.');
    res.status(200).json({ message: 'Registrasi berhasil. Email konfirmasi telah dikirim.' });
  } catch (error) {
    console.error('Gagal mendaftarkan pengguna:', error);
    res.status(500).json({ error: 'Gagal mendaftarkan pengguna.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});
