import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

dotenv.config();
import feedbackRoutes from './routes/feedback.routes.js';


const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());


app.use('/api/feedback', feedbackRoutes);




// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json(user);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});


// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid email'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: 'Invalid password'
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ADMIN LOGIN
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    let validPassword = false;
    if (password === admin.password) {
      validPassword = true;
    } else {
      validPassword = await bcrypt.compare(password, admin.password);
    }

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, role: 'ADMIN' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, admin });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// TEMPORARY SETUP ROUTE TO CREATE THE FIRST ADMIN
app.post('/api/auth/admin/setup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hash password just like regular users (optional, but good practice)
    const hashedPassword = await bcrypt.hash(password || "Modern@2026$", 10);

    const admin = await prisma.admin.create({
      data: {
        email: email || "admin@modernsupplyeg.com",
        password: hashedPassword
      }
    });

    res.json({ message: "Admin created successfully!", admin });
  } catch (error) {
    res.status(500).json({ message: "Failed to create admin (it might already exist)", error: error.message });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});