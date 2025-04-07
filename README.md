# OS Grid Manager

A comprehensive web-based management platform for OpenSimulator that simplifies virtual world infrastructure management through intuitive, user-friendly interfaces.

![OS Grid Manager Screenshot](https://github.com/sirswaghorse/os-grid-manager/assets/screenshot.png)

## Overview

OS Grid Manager provides a "one-click" setup experience for creating and managing OpenSimulator virtual worlds (grids). With an easy-to-use web interface, it allows both technical and non-technical users to:

- Create and configure OpenSimulator grids with minimal effort
- Manage regions, users, and grid settings through a unified dashboard
- Customize login screens and splash pages
- Facilitate region purchases with integrated payment processing
- Browse and manage marketplace items (Beta)

## Features

### For Grid Administrators
- **One-Click Grid Setup**: Automatically configure OpenSimulator with best-practice settings
- **Grid Dashboard**: Monitor users, regions, and system status
- **Region Management**: Add, modify, and remove regions with visual map interface
- **User Administration**: Manage user accounts and permissions
- **System Settings**: Configure core grid settings, currency options, and voice chat
- **Login Customization**: Personalize the login screen with custom text or logo

### For Users
- **Account Management**: Self-service registration and profile settings
- **Region Purchasing**: Browse available region sizes and complete purchases
- **Avatar Selection**: Choose from default OpenSimulator avatars during registration
- **Marketplace Access**: Buy and sell virtual items (Beta feature)
- **Inventory Management**: Upload and manage marketplace items

## Installation

### Prerequisites
- Ubuntu 22.04 LTS (recommended)
- Node.js 18+ and npm
- OpenSimulator installation

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/sirswaghorse/os-grid-manager.git
cd os-grid-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm run dev  # For development
# or
npm run start  # For production
```

4. Access the admin panel at `http://your-server:5000`
5. Default login: 
   - Username: `admin`
   - Password: `admin`
   - **Important**: Change this password immediately after first login

## Production Deployment

For production environments:

1. Configure a persistent database (PostgreSQL recommended)
2. Set up proper firewall rules:
   - Port 5000: OS Grid Manager web interface
   - Port 8002: Grid login
   - Port 8003: Grid services
   - Ports 9000+: For individual regions

3. Install PM2 for process management:
```bash
npm install -g pm2
pm2 start npm --name "os-grid-manager" -- run start
pm2 save
pm2 startup
```

4. Consider setting up Nginx as a reverse proxy with SSL/TLS

## System Requirements

Minimum recommended specifications:
- 2 CPU cores (dedicated vCPU recommended for production)
- 4GB RAM
- 40GB SSD storage
- Ubuntu 22.04 LTS

## Configuration

After installation, use the admin panel to configure:
1. Path to your OpenSimulator installation
2. Grid name and welcome message
3. Region size templates and pricing
4. Login screen appearance
5. Splash page content
6. Marketplace settings (Beta)
7. PayPal integration (for region purchases)

## Development

This application is built with:
- TypeScript
- Express.js backend
- React frontend with shadcn/ui components
- PostgreSQL database support (optional)

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenSimulator community
- Created by SirSwagHorse

## Support

For support or questions, please open an issue on this repository.

---

*Note: The Marketplace feature is currently in Beta and may have limited functionality.*