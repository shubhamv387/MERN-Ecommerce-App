import app from './app'
import { PORT } from './secrets'

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`))
