/* ═══════ Milan Dahal — Portfolio Data (single source of truth) ═══════ */
window.PORTFOLIO_DATA = {
  meta: {
    name: 'Milan Dahal',                                                                                                                                                                                                                                                                                                                                                              
    title: 'Milan Dahal — Portfolio',
    tagline: 'Web Developer from Kathmandu, Nepal',                                                                                                                       
    avatarEmoji: '👨💻',
    flag: '🇳🇵',
  },
  profile: {
    hello: '// Hello World, my name is',
    name: 'Milan Dahal',
    wave: '👋',
    status: 'Open to work',
    roles: [
      'Web Developer', 'Frontend Developer', 'QA Engineer', 'Problem Solver', 'Lifelong Learner','Aspiring Full-stack Developer','Open Source Contributor','Tech Enthusiast','UI/UX Designer','Team Player'
    ],
    location: 'Kathmandu, Nepal',
    email: 'milandahal685@gmail.com',
    github: 'https://github.com/milandahal1000',
    linkedin: 'https://www.linkedin.com/in/milan-dahal',
    timezone: 'Asia/Kathmandu (UTC+5:45)',
    intro: 'A web developer from Kathmandu, Nepal who loves building clean, fast and user-friendly websites & web applications. Also actively learning about QA and testing while focusing mainly on automated testing. Currently looking for opportunities to create great products with great people.',
    stats: [
      { label: 'Years Coding', value: 3 },
      { label: 'Projects Built', value: 10 },
      { label: 'Certificates', value: 5 },
    ],
  },
  about: {
    heading: 'I create websites & web applications that people love to use',
    role: 'Web Developer',
    paragraphs: [
      "I'm a passionate developer from Kathmandu, Nepal who constantly seeks out innovative solutions to everyday problems. I enjoy turning ideas into real products — from pixel-perfect frontends to solid, reliable backends.",
      "When I'm not coding, you'll find me exploring new technologies, contributing to open source, or hiking around the beautiful hills of Nepal.",
    ],
    languages: [
      { name: 'Nepali', level: 'Native' },
      { name: 'English', level: 'Fluent' },
      { name: 'Hindi', level: 'Fluent' },
    ],
    education: { degree: 'BIT', institute: 'Phoenix College of Management & IT',university:'Lincoln University', city: 'Kathmandu, Nepal' },
    location: { city: 'Maitedevi,Kathmandu, Nepal', tz: 'UTC+5:45' },
  },
  experience: [
    {
      period: '2024 — Present',
      role: 'Freelance Web Developer',
      company: 'Self-employed',
      location: 'Kathmandu, Nepal',
      bullets: [
        'Designed and developed responsive websites for local businesses and startups.',
        'Built full-stack web apps with authentication, databases and REST APIs.',
        'Deployed and maintained projects on Vercel and Netlify.',
      ],
      tags: ['React', 'Node.js', 'MongoDB', 'Vercel'],
    },
    {
      period: '2023 — 2024',
      role: 'Web Development Intern',
      company: 'Tech Company',
      location: 'Kathmandu, Nepal',
      bullets: [
        'Assisted the team in building and styling responsive UI components.',
        'Fixed bugs and improved accessibility across existing web pages.',
        'Learned professional Git workflows, code reviews and agile practices.',
      ],
      tags: ['HTML', 'CSS', 'JavaScript', 'Git'],
    },
    {
      period: '2022 — 2023',
      role: 'Self-Taught Developer & Student',
      company: 'Personal projects',
      location: 'Kathmandu, Nepal',
      bullets: [
        'Built personal projects to master JavaScript, React and backend basics.',
        'Solved data structures & algorithms problems to sharpen fundamentals.',
        'Started freelancing with small websites for friends and local shops.',
      ],
      tags: ['JavaScript', 'Python', 'DSA'],
    },
  ],
skills: {
    languages: [
      { name: 'Python', level: 75 }, {name: 'Selenium', level: 80},
      { name: 'Java', level: 70 }, { name: 'SQL', level: 78 },
    ],
    frontend: [
      { name: 'HTML5', level: 95 }, { name: 'CSS3', level: 92 }, { name: 'React', level: 88 },
      { name: 'Tailwind CSS', level: 85 }, { name: 'Bootstrap', level: 82 }, { name: 'Responsive Design', level: 90 },
    ],
    backend: [
      { name: 'Node.js', level: 85 }, { name: 'Express.js', level: 82 }, { name: 'MongoDB', level: 80 },
      { name: 'MySQL', level: 78 }, { name: 'REST APIs', level: 88 }, { name: 'Firebase', level: 76 },
    ],
    tools: [
      { name: 'Git & GitHub', level: 90 }, { name: 'VS Code', level: 95 }, { name: 'Figma', level: 80 },
      { name: 'Vercel', level: 84 }, { name: 'Linux', level: 70 },{ name: 'Jira', level: 75 },{ name: 'Render', level: 78},{name: 'Railway', level: 80},
    ],
  },
  projects: [
    {
      title: 'E-Commerce Store', emoji: '🛒', category: 'Full-stack',
      blurb: 'Full-stack online store with cart, authentication and payment integration.',
      description: 'A complete e-commerce experience with a product catalog, shopping cart, Stripe checkout, admin dashboard and order tracking. Built on a REST API with JWT authentication.',
      features: ['Product catalog with search & filters', 'Shopping cart + Stripe checkout', 'JWT auth with admin dashboard', 'Order tracking & email notifications'],
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      links: { github: 'https://github.com/milandahal1000', live: '' },
    },
    {
      title: 'Task Manager App', emoji: '✅', category: 'Frontend',
      blurb: 'Kanban board with drag & drop, labels, deadlines and dark mode.',
      description: 'A productivity board inspired by Trello. Create boards, drag cards between lanes, set deadlines and filter by labels. Fully responsive with persisted state.',
      features: ['Drag & drop kanban boards', 'Labels, priorities & deadlines', 'Filtering & live search', 'Dark / light mode toggle'],
      tags: ['React', 'TypeScript', 'LocalStorage'],
      links: { github: 'https://github.com/milandahal1000', live: '' },
    },
    {
      title: 'Weather Dashboard', emoji: '🌤️', category: 'Frontend',
      blurb: 'Real-time weather dashboard with charts, geolocation and forecasts.',
      description: 'A weather app that uses the OpenWeatherMap API to show current conditions, an hourly chart and a 7-day forecast. Detects the user location and falls back to manual search.',
      features: ['Live API weather data', 'Hourly charts & 7-day forecast', 'Geolocation detection', 'Unit toggle °C / °F'],
      tags: ['JavaScript', 'REST API', 'Chart.js'],
      links: { github: 'https://github.com/milandahal1000', live: '' },
    },
    {
      title: 'Chat Application', emoji: '💬', category: 'Backend',
      blurb: 'Real-time chat rooms with typing indicators and online presence.',
      description: 'A real-time messaging app with multiple rooms, typing indicators, read receipts and live online presence. Built on WebSockets for instant delivery.',
      features: ['WebSocket real-time messaging', 'Rooms, typing & presence', 'Message history with MongoDB', 'Graceful reconnection'],
      tags: ['Socket.io', 'Node.js', 'MongoDB'],
      links: { github: 'https://github.com/milandahal1000', live: '' },
    },
    {
      title: 'Blog Platform', emoji: '📝', category: 'Full-stack',
      blurb: 'Markdown-based blogging platform with tags, search and an admin panel.',
      description: 'A CMS where writers can publish Markdown articles, attach tags, and manage posts from an admin panel. Readers get instant search, filtering and a clean reading experience.',
      features: ['Markdown editor with preview', 'Tags, search & pagination', 'Admin auth & post management', 'SEO-friendly meta tags'],
      tags: ['React', 'Firebase', 'Express'],
      links: { github: 'https://github.com/milandahal1000', live: '' },
    },
    {
      title: 'Portfolio Website', emoji: '💻', category: 'Frontend',
      blurb: 'This VS Code themed portfolio website you are browsing right now.',
      description: 'The site you are looking at! A VS Code inspired portfolio with editor tabs, a working terminal, command palette, theming and a fully data-driven content layer.',
      features: ['VS Code editor UI experience', 'Working terminal & command palette', '6 accent themes', 'Data-driven content via data.js'],
      tags: ['HTML', 'CSS', 'JavaScript'],
      links: { github: 'https://github.com/milandahal1000', live: '' },
    },
  ],
  commits: [
    { msg: 'initial commit — portfolio boilerplate', time: '3 days ago' },
    { msg: 'feat: add skills.json with proficiency levels', time: '2 days ago' },
    { msg: 'feat: projects grid + search', time: 'yesterday' },
    { msg: 'feat: open to work 🚀', time: 'now' },
  ],
};