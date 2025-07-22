import express, { Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import productRoutes from './handlers/products'
import userRoutes from './handlers/users'
import orderRoutes from './handlers/orders'

const app: express.Application = express()
const address: string = "0.0.0.0:3000"

app.use(cors())
app.use(bodyParser.json())

app.get('/', function (req: Request, res: Response) {
    res.send('Hello World!')
})

userRoutes(app)
productRoutes(app)
orderRoutes(app)

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app
