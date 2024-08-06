import app from './app'
import { NODE_ENV, PORT } from './secrets'

app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT} in ${NODE_ENV} environment`),
)
