# NoteS - AI-Powered Learning Platform

A modern web-based learning platform featuring AI-powered study tools, course management, and interactive learning resources.

## Features

### 🤖 AI Study Tools
- Generate comprehensive study notes on any topic
- Smart content structuring with sections and subsections
- Export notes to PDF format
- Real-time note generation progress tracking

### 📚 Course Management
- View and track course progress
- Access course materials and resources
- Monitor upcoming assignments
- Track completion status

### 🎯 Dashboard
- Quick overview of upcoming classes
- Due assignments tracker
- Progress monitoring
- Recent activity feed

### 📑 Resources
- Organized learning materials
- Searchable resource library
- Categorized content
- Easy navigation

### 💬 Communication
- Integrated messaging system
- Discussion forums
- Community interaction
- Real-time notifications

## Technologies Used

- HTML5 & CSS3
- JavaScript (ES6+)
- Google Gemini API for AI features
- Groq API (fallback)
- PDF Make for document generation
- Font Awesome icons
- Inter & JetBrains Mono fonts

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/NoteS.git
```

2. Configure API keys:
   - Create a `js/config.js` file with your API keys:
```javascript
const CONFIG = {
    GEMINI_API_KEY: "your_gemini_api_key",
    GROQ_API_KEY: "your_groq_api_key"
};
```

3. Serve the application:
   - Use a local development server (e.g., Live Server for VS Code)
   - Or configure your preferred web server

## Usage

1. **Generate Study Notes**:
   - Navigate to "Study Tools"
   - Enter your topic
   - Click "Generate Notes"
   - Download as PDF when ready

2. **Access Courses**:
   - Browse available courses
   - Track progress
   - Access course materials

3. **Use Dashboard**:
   - View upcoming schedule
   - Check due assignments
   - Monitor overall progress

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini API for AI capabilities
- Groq API for backup AI processing
- Font Awesome for icons
- Google Fonts for typography

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)
Project Link: [https://github.com/yourusername/NoteS](https://github.com/yourusername/NoteS)