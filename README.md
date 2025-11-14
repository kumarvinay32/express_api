# Express API Microservice

A comprehensive Node.js API microservice framework built on Express, MySQL2, and Sequelize. This package provides a complete, production-ready setup to rapidly develop robust APIs for your applications.

## ✨ Features

- **🚀 Automated Setup** - Get started instantly with zero-configuration defaults
- **📊 Auto Response Formatting** - Consistent API response structure out of the box
- **🗄️ Flexible Database Support** - Compatible with MySQL1, MySQL2, and Sequelize with connection pooling
- **🛠️ Configurable Error Messages** - Customize database error messages to match your needs
- **🌍 Multilingual Support** - Built-in internationalization for response messages
- **📝 Response Logger Hook** - Configurable logging for all API responses
- **⚡ Thread Support** - Execute functions asynchronously with minimal code changes
- **🔍 Thread Logging** - Enhanced debugging capabilities for threaded operations
- **📚 Helper Function Library** - Pre-built utilities to accelerate API development
- **📄 File Logging** - Generate log files instead of console output
- **🔐 Response Header Management** - Built-in CORS and header configuration (no additional packages needed)

## 📦 Installation

Configure your application using environment variables to specify the source directory and project type.

### Environment Variables

| Variable  | Description                              | Default | Options        |
|-----------|------------------------------------------|---------|----------------|
| `SRC`     | Application source directory             | `src`   | Any valid path |

### Method 1: Using .env File (Recommended)

1. Create a `.env` file in your project root:
```env
NODE_ENV=dev
SRC=src
```

2. Install the package:
```sh
npm install @krvinay/express_api
```

### Method 2: Linux / macOS

```sh
SRC=src npm install @krvinay/express_api
```

### Method 3: Windows (CMD or PowerShell)

```sh
# Install cross-env (if not already installed)
npm install --save-dev cross-env

npx cross-env SRC=src npm install @krvinay/express_api
```

## 🚀 Getting Started

### Fresh Installation

1. Create a new project directory:
```sh
mkdir my-api-project
cd my-api-project
```

2. Initialize npm:
```sh
npm init -y
```

3. Install the package using one of the methods above.

4. Start your application:
```sh
node server.js
```

### Integrating with Existing Projects

If you're installing this package in an existing project, you'll need to:

1. Edit `routes/index.js` to integrate with your existing route structure
2. Merge any conflicting configuration files

> [!TIP]
> Set `SRC="/"` to skip source directory creation. The package will treat your root directory as the source directory.

## 📁 Project Structure

After installation, the following structure will be generated:

```
project-root/
├── src/                          # Source directory (configurable)
│   ├── activities/               # Thread-related files and functions
│   │   └── index.js              # Sample thread function
│   ├── config/                   # Configuration files
│   │   └── appConfig.js          # Main configuration file
│   ├── helpers/                  # Utility function library
│   │   └── index.js              # Helper functions
│   ├── lang/                     # Internationalization files
│   │   ├── en.js                 # English translations
│   │   └── hi.js                 # Hindi translations
│   ├── logs/                     # Log files directory
│   ├── models/                   # Database models
│   │   ├── datasource/           # Sequelize table schemas
│   │   └── index.js              # Database connection (MySQL/Sequelize)
│   └── routes/                   # API route definitions
│       └── index.js              # Main route file
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
└── server.js                     # Application entry point
```

## ⚙️ Configuration

### For New Projects

The package automatically creates a `server.js` file. Simply run:
```sh
node server.js
```

### For Existing Projects

> [!NOTE]
> If you already have a `server.js` file, update it with the following code:

```javascript
require("dotenv").config();
const server = require('express')();
const { json, urlencoded } = require('express');
const default_port = 8080;

// Middleware configuration
server.use(json({ limit: '50mb', extended: true }));
server.use(urlencoded({ limit: '50mb', extended: true }));

// Initialize Express API package
server.use(require("@krvinay/express_api"));

// Start server
server.listen(process.env.PORT || default_port, () => {
    console.log(`Server running on port ${process.env.PORT || default_port}`);
});
```

## 🔧 Environment Configuration

Create a `.env` file in your project root with the following variables:

```env
# Node Application environment
NODE_ENV=dev

# Server Configuration
PORT=8080

# Source Directory (default: src)
SRC=src

# Database Configuration (add your database credentials)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=your_database
```

## 📖 Usage

Once installed and configured, you can start building your API by:

1. **Adding Routes** - Define your endpoints in `src/routes/index.js`
2. **Creating Models** - Add database models in `src/models/`
3. **Writing Helpers** - Create utility functions in `src/helpers/`
4. **Configuring Languages** - Add translations in `src/lang/`
5. **Implementing Threads** - Add background tasks in `src/activities/`

## 👤 Author

**Vinay Kumar**
- Package: [@krvinay/express_api](https://www.npmjs.com/package/@krvinay/express_api)

## 🆘 Support

For issues and questions, please visit the [GitHub repository](https://github.com/krvinay/express_api) or open an issue.