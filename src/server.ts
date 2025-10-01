import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import productRoutes from './handlers/products';
import userRoutes from './handlers/users';
import orderRoutes from './handlers/orders';
import cors from 'cors';
import { initializeDatabase } from './scripts/initialize';

const app: express.Application = express()
const address: string = "0.0.0.0:3000"

app.use(cors())
app.use(bodyParser.json())

app.get('/', function (req: Request, res: Response) {
    res.send('Hello World!');
});

productRoutes(app);
userRoutes(app);
orderRoutes(app);

// Initialize database with seed data on startup
const startServer = async () => {
  try {
    // Run seeds on startup (only in development or if specifically enabled)
    if (process.env.AUTO_SEED === 'true' || process.env.ENV === 'dev') {
      await initializeDatabase();
    }
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';

    app.listen(port, function () {
        console.log(`Starting app on: ${host}:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
