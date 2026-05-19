import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();


router.get('/', async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب البيانات" });
  }
});


router.post('/', async (req, res) => {
  try {
    const data = req.body;

    // تأكد أن data و data.client موجودين قبل محاولة استخدامهما
    if (!data || !data.client) {
      return res.status(400).json({ error: "بيانات العميل (client) مفقودة في الطلب" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        // إذا كنت ترسل ID يدوياً، تأكد أنه موجود، وإلا اتركه لـ Prisma
        id: data.id || undefined, 

        company: data.client.company || "N/A",
        country: data.client.country || "N/A",
        contact: data.client.contact || "N/A",
        email: data.client.email || "N/A",
        orderNumber: data.client.orderNumber || "N/A",

        overallRating: Number(data.overallRating) || 0,
        recommend: data.recommend || "",
        workAgain: data.workAgain || "",
        priceSuitability: data.priceSuitability || "",

        liked: data.comments?.liked || "",
        improve: data.comments?.improve || "",
        suggestions: data.comments?.suggestions || "",

        ratings: data.ratings || {},

        userId: Number(data.userId) || 1, // تأكد أن المستخدم رقم 1 موجود في قاعدة البيانات
        
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      }
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error("Prisma Error Details:", error);
    res.status(500).json({ error: "حدث خطأ أثناء حفظ البيانات", details: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await prisma.feedback.delete({
      where: {
        id: req.params.id
      }
    });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "فشل في حذف التقييم" });
  }
});

export default router;