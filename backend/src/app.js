const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const { env } = require("./config/env");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");
const { uploadRootDir } = require("./middlewares/uploadMiddleware");

const app = express();
const allowedOrigins = [
  env.clientUrl,
  ...env.clientUrls
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(uploadRootDir, {
    setHeaders(res) {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
  })
);

app.get("/", (req, res) => {
  void req;
  res.json({
    success: true,
    message: "Welcome to the Jersea API"
  });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = { app };
