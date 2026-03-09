import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/config/db.js";
import musicRoutes from "./src/routes/musicRoutes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 路由：健康检查
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 挂载音乐相关的 API 路由
  app.use("/api/music", musicRoutes);

  // Vite 开发中间件 (用于处理前端 React 代码)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // 生产环境托管静态文件
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
