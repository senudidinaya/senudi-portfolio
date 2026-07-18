// Content schema + the seed used before anything is saved in the database,
// and as the "reset to default" baseline. The live site reads its content
// from the DB (see src/lib/content.ts) and falls back to this.

export type Metric = { value: string; label: string };

export type SkillGroup = { label: string; items: string[] };

export type Project = {
  title: string;
  kind: string;
  timeframe: string;
  summary: string;
  highlights: string[];
  stack: string[];
  metric?: { value: string; label: string };
  link?: { href: string; label: string };
};

export type Profile = {
  name: string;
  roles: string[];
  headline: string;
  openTo: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  resumeFile: string;
  theBridge: { ask: string; build: string };
  tagline: string;
};

export type SiteContent = {
  profile: Profile;
  metrics: Metric[];
  about: { paragraphs: string[] };
  skills: { business: SkillGroup; technical: SkillGroup; shared: SkillGroup };
  projects: Project[];
  publication: {
    title: string;
    role: string;
    venue: string;
    date: string;
    doi: string;
    doiUrl: string;
  };
  education: { school: string; credential: string; timeframe: string }[];
  additional: { languages: string[]; activities: string[] };
  contact: {
    emailjs: { serviceId: string; templateId: string; publicKey: string };
  };
};

export const defaultContent: SiteContent = {
  profile: {
    name: "Senudi Rupasinghe",
    roles: ["Business & Technical Analysis", "Full-Stack Software Development"],
    headline: "Business Analyst & Software Engineer",
    openTo: "Open to Business Analyst & Software Engineer roles",
    location: "Ragama, Sri Lanka",
    email: "senudi.d.rupasinghe@gmail.com",
    phone: "+94 75 394 2120",
    linkedin: "https://linkedin.com/in/senudi-rupasinghe",
    github: "https://github.com/senudidinaya",
    resumeFile: "/Senudi_Rupasinghe_CV.pdf",
    theBridge: {
      ask: "“The sales team needs this to work.”",
      build: "A shipped feature in React + a Ballerina integration.",
    },
    tagline:
      "I turn what the business needs into what engineering ships — across the frontend, the backend, and the research behind it.",
  },
  metrics: [
    { value: "97.8%", label: "screening-model accuracy" },
    { value: "6 mo", label: "engineering at WSO2" },
    { value: "IEEE", label: "peer-reviewed publication" },
    { value: "1,155", label: "labelled samples analysed" },
  ],
  about: {
    paragraphs: [
      "I’m an Information Technology graduate from SLIIT (2026) who works best in the gap between a business problem and a technical solution. I like sitting with the people who have the need, understanding what they’re really asking for, and then building the thing that answers it.",
      "At WSO2, that meant spending six months translating the global sales team’s requests into working features — building the React/TypeScript frontend and the Ballerina backend integrations for an internal app they use every day.",
      "My final-year research pushed the same instinct further: I took a fuzzy behavioural-screening problem, specified it into requirements, and delivered an auditable AI pipeline that reached 97.8% test accuracy — documented end to end and published at an IEEE conference.",
    ],
  },
  skills: {
    business: {
      label: "The business side",
      items: [
        "Requirements gathering & translation",
        "Technical documentation",
        "Solution specification",
        "Stakeholder collaboration",
        "Agile delivery",
      ],
    },
    technical: {
      label: "The technical side",
      items: [
        "TypeScript / JavaScript",
        "Python",
        "Java",
        "C# / .NET / ASP.NET Core / EF Core",
        "React / React Native / Redux",
        "FastAPI / Node.js / Express",
        "Ballerina",
      ],
    },
    shared: {
      label: "Data, architecture & AI",
      items: [
        "SQL / PostgreSQL / MongoDB / SQL Server",
        "Data modelling & REST API design",
        "Retrieval-augmented generation (RAG)",
        "LLM APIs (Gemini, Groq)",
        "scikit-learn",
      ],
    },
  },
  projects: [
    {
      title: "Cultivator Intention Analyzer",
      kind: "Final-year research · individual thesis",
      timeframe: "2025 – 2026",
      summary:
        "A multi-modal behavioural-screening pipeline that classifies intent-risk from fused audio and text signals — taken from a fuzzy problem statement all the way to a documented, evaluated system.",
      highlights: [
        "Specified the problem into requirements, then designed an intent-risk classifier over 16 fused audio + text features on 1,155 labelled samples.",
        "Built an auditable, risk-aware decision architecture: the LLM (Groq / Llama-3.3-70B) is constrained to explanation only, and degraded or unknown evidence never auto-approves.",
        "Produced full research documentation — requirements, solution spec, and experimental evaluation — reviewed by academic panels.",
      ],
      stack: ["React Native", "TypeScript", "FastAPI", "Python", "scikit-learn", "Agora RTC"],
      metric: { value: "97.8%", label: "test accuracy" },
    },
    {
      title: "Chest X-Ray Pneumonia Screening — EfficientNet-B0",
      kind: "Deep-learning module · CNN architecture benchmark",
      timeframe: "2025",
      summary:
        "A transfer-learning pipeline that screens chest X-rays for pneumonia by fine-tuning EfficientNet-B0 — my contribution to a team study benchmarking CNN and Vision-Transformer architectures on the same clinical dataset.",
      highlights: [
        "Fine-tuned an ImageNet-pretrained EfficientNet-B0 (timm / PyTorch) with AdamW, cosine-annealing LR, mixed-precision training, gradient clipping and image augmentation.",
        "Selected the model by validation ROC-AUC with early stopping, reaching 0.955 test ROC-AUC at ~99% sensitivity — deliberately tuned to catch nearly every pneumonia case, the priority in screening.",
        "Built a reproducible, config-driven codebase (seeded runs; separate data / model / train / eval modules) reporting sensitivity, specificity, F1 and confusion-matrix / ROC-curve diagnostics.",
      ],
      stack: ["Python", "PyTorch", "timm", "torchvision", "scikit-learn", "NumPy"],
      metric: { value: "0.955", label: "test ROC-AUC · pneumonia screening" },
    },
    {
      title: "Sales Pitstop",
      kind: "WSO2 · internal app for the global sales team",
      timeframe: "Jan – Jun 2025",
      summary:
        "The internal application WSO2’s sales team relies on. I translated their business needs into working product features and built the app across the stack.",
      highlights: [
        "Built and maintained the frontend in React, TypeScript and Redux.",
        "Developed backend integration logic in Ballerina, connecting the app to internal systems.",
        "Worked in an Agile team with Git branch-and-PR workflows, peer reviews and iterative delivery.",
      ],
      stack: ["React", "TypeScript", "Redux", "Ballerina", "Git"],
    },
    {
      title: "StudyMate",
      kind: "RAG study companion · in progress",
      timeframe: "2026",
      summary:
        "A retrieval-augmented study tool where students upload lecture PDFs and get source-grounded answers — built around a PostgreSQL + pgvector data architecture.",
      highlights: [
        "Designing the data architecture around PostgreSQL with pgvector embeddings.",
        "Grounding every answer in the student’s own uploaded material via a LangChain retrieval pipeline.",
      ],
      stack: ["React", "TypeScript", "FastAPI", "Python", "PostgreSQL + pgvector", "LangChain", "OpenAI API"],
    },
    {
      title: "ASP.NET Core Web API + EF Core — full-stack demo",
      kind: "Personal project · .NET foundation",
      timeframe: "2023 – 2024",
      summary:
        "A full-stack application pairing an ASP.NET Core Web API backend with a Windows Forms frontend, using Entity Framework Core for data access — an end-to-end build from API to UI.",
      highlights: [
        "Built the backend as an ASP.NET Core Web API with Entity Framework Core for the data layer.",
        "Connected a Windows Forms frontend to the API to deliver a complete, working user experience.",
      ],
      stack: ["C#", ".NET", "ASP.NET Core", "Entity Framework Core", "SQL Server"],
    },
    {
      title: "Employee Records API (Microsoft.Data.SqlClient)",
      kind: "Personal project · .NET foundation",
      timeframe: "2023 – 2024",
      summary:
        "An ASP.NET Core Web API for managing employee records, using Microsoft.Data.SqlClient for direct, efficient CRUD against a SQL Server database.",
      highlights: [
        "Implemented secure endpoints to add, retrieve, update and delete employee data.",
        "Used Microsoft.Data.SqlClient for concise, effective data access against SQL Server.",
      ],
      stack: ["C#", "ASP.NET Core", "Microsoft.Data.SqlClient", "SQL Server", "T-SQL"],
    },
    {
      title: "MovieApp — ASP.NET Core Razor Pages",
      kind: "Personal project · .NET foundation",
      timeframe: "2023 – 2024",
      summary:
        "A Razor Pages application built while learning ASP.NET Core, capturing practical examples and insights from getting started as an ASP.NET Core developer.",
      highlights: [
        "Explored ASP.NET Core development with a focus on the Razor Pages model.",
        "Collected working code snippets and notes as a hands-on getting-started reference.",
      ],
      stack: ["C#", "ASP.NET Core", "Razor Pages"],
    },
    {
      title: "REST API practice — CRUD",
      kind: "Personal project · .NET foundation",
      timeframe: "2023 – 2024",
      summary:
        "A hands-on REST API with full CRUD functionality, built against an open web API to practise API design and data flow.",
      highlights: [
        "Implemented create, read, update and delete operations end to end.",
        "Practised consuming and exposing REST endpoints using an open web API.",
      ],
      stack: ["C#", "ASP.NET Core", "REST"],
    },
  ],
  publication: {
    title:
      "Smart Agri-Suite: A Globally Deployable Machine Learning Platform for Satellite-Driven Idle Land Mobilization and Smallholder Agricultural Decision Support",
    role: "Co-author",
    venue:
      "8th International Congress on Human-Computer Interaction, Optimization and Robotic Applications (ICHORA 2026), IEEE",
    date: "May 2026",
    doi: "10.1109/ICHORA69329.2026.11537179",
    doiUrl: "https://doi.org/10.1109/ICHORA69329.2026.11537179",
  },
  education: [
    {
      school: "SLIIT, Malabe",
      credential: "BSc (Hons) in Information Technology",
      timeframe: "2022 – 2026",
    },
    {
      school: "Lyceum International School, Wattala",
      credential: "GCE Advanced Level — Mathematics, Computer Science, Physics",
      timeframe: "2020 – 2022",
    },
  ],
  additional: {
    languages: ["English (full professional)", "Sinhala (limited working)"],
    activities: ["AIESEC", "School Colours — Swimming"],
  },
  contact: {
    // EmailJS (client-side send). Public key is meant to be public.
    // Placeholder values fall back to a mailto: link.
    emailjs: {
      serviceId: "service_28u43dt",
      templateId: "template_lfp6tfd",
      publicKey: "Qp7kUF4ouIB4remSm",
    },
  },
};
